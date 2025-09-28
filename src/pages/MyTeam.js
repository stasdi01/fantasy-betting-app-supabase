import React, { useState, useMemo, useCallback } from 'react';
import {
  Target, Users, Trophy, Plus, Star, Crown, Timer, Calendar,
  TrendingUp, Zap, Award, Clock, ChevronRight, User, Gamepad2,
  Shield, Diamond, Flame, Trash2, Edit3, CheckCircle
} from 'lucide-react';
import { useMyTeam } from '../hooks/useMyTeam';
import { useAuth } from '../context/AuthContext';
import { positions } from '../data/euroLeagueData';
import LoadingSpinner from '../components/Loading/LoadingSpinner';
import '../styles/MyTeam.css';

const MyTeam = () => {
  const { profile } = useAuth();
  const {
    currentRoster,
    userTeams,
    selectedTeamIndex,
    teamHistory,
    currentRound,
    loading,
    addPlayerToRoster,
    removePlayerFromRoster,
    addPlayerPrediction,
    removePlayerPrediction,
    switchTeam,
    validateRoster,
    submitTeam,
    getRosterSummary,
    getPlayersByPosition,
    getPlayerById,
    getPlayerPredictions,
    getMaxTeamsAllowed,
    isRoundActive,
    getRoundStatus,
    getTimeUntilDeadline
  } = useMyTeam();

  const [selectedPosition, setSelectedPosition] = useState('PG');
  const [selectedSection, setSelectedSection] = useState('starters');
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [activeTab, setActiveTab] = useState('team');

  // Memoized computations
  const rosterSummary = useMemo(() => getRosterSummary(), [getRosterSummary]);
  const validation = useMemo(() => validateRoster(), [validateRoster]);
  const maxTeamsAllowed = useMemo(() => getMaxTeamsAllowed, [getMaxTeamsAllowed]);

  // Event handlers
  const handleAddPlayer = useCallback((position, section) => {
    setSelectedPosition(position);
    setSelectedSection(section);
    setShowPlayerModal(true);
  }, []);

  const handleSelectPlayer = useCallback((player) => {
    const result = addPlayerToRoster(player, selectedPosition, selectedSection === 'starters');
    if (result.success) {
      setShowPlayerModal(false);
    }
  }, [addPlayerToRoster, selectedPosition, selectedSection]);

  const handleRemovePlayer = useCallback((playerId, position, isStarter) => {
    removePlayerFromRoster(playerId, position, isStarter);
  }, [removePlayerFromRoster]);

  const handleOpenPrediction = useCallback((player) => {
    setSelectedPlayer(player);
    setShowPredictionModal(true);
  }, []);

  if (loading) {
    return (
      <div className="myteam-loading">
        <LoadingSpinner size="lg" />
        <p>Loading MyTeam...</p>
      </div>
    );
  }

  // Get round status info
  const roundStatus = getRoundStatus(currentRound);
  const timeUntilDeadline = getTimeUntilDeadline(currentRound);
  const isActive = isRoundActive(currentRound);

  return (
    <div className="myteam-modern-container">
      {/* Hero Header */}
      <div className="myteam-hero">
        <div className="hero-background">
          <div className="hero-overlay"></div>
          <div className="hero-particles"></div>
        </div>

        <div className="hero-content">
          <div className="hero-icon">
            <Gamepad2 size={48} />
          </div>
          <div className="hero-text">
            <h1>MyTeam EuroLeague</h1>
            <p>Build your fantasy team and predict player performances</p>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <Crown size={20} />
              <span>Round {currentRound?.round_number || 1}</span>
            </div>
            <div className="hero-stat">
              <Timer size={20} />
              <span className={`deadline ${!isActive ? 'expired' : ''}`}>
                {isActive ? timeUntilDeadline : 'Deadline Passed'}
              </span>
            </div>
            <div className="hero-stat">
              <Trophy size={20} />
              <span>Team {selectedTeamIndex + 1}/{userTeams.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="myteam-nav">
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            <Users size={20} />
            <span>Team Builder</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'draft' ? 'active' : ''}`}
            onClick={() => setActiveTab('draft')}
          >
            <Target size={20} />
            <span>Player Draft</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'predictions' ? 'active' : ''}`}
            onClick={() => setActiveTab('predictions')}
          >
            <TrendingUp size={20} />
            <span>Predictions</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <Clock size={20} />
            <span>History</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="myteam-content">
        {activeTab === 'team' && (
          <TeamBuilderTab
            currentRoster={currentRoster}
            rosterSummary={rosterSummary}
            validation={validation}
            isActive={isActive}
            onAddPlayer={handleAddPlayer}
            onRemovePlayer={handleRemovePlayer}
            onOpenPrediction={handleOpenPrediction}
            onSubmitTeam={submitTeam}
          />
        )}

        {activeTab === 'draft' && (
          <PlayerDraftTab
            positions={positions}
            getPlayersByPosition={getPlayersByPosition}
            onSelectPlayer={handleSelectPlayer}
            currentRoster={currentRoster}
          />
        )}

        {activeTab === 'predictions' && (
          <PredictionsTab
            currentRoster={currentRoster}
            getPlayerPredictions={getPlayerPredictions}
            onOpenPrediction={handleOpenPrediction}
          />
        )}

        {activeTab === 'history' && (
          <HistoryTab
            teamHistory={teamHistory}
            userTeams={userTeams}
          />
        )}
      </div>

      {/* Modals */}
      {showPlayerModal && (
        <PlayerSelectionModal
          position={selectedPosition}
          section={selectedSection}
          players={getPlayersByPosition(selectedPosition)}
          onSelect={handleSelectPlayer}
          onClose={() => setShowPlayerModal(false)}
        />
      )}

      {showPredictionModal && selectedPlayer && (
        <PredictionModal
          player={selectedPlayer}
          onSubmit={(predictionData) => {
            addPlayerPrediction(selectedPlayer.id, predictionData);
            setShowPredictionModal(false);
          }}
          onClose={() => setShowPredictionModal(false)}
        />
      )}
    </div>
  );
};

// Team Builder Tab Component
const TeamBuilderTab = ({
  currentRoster,
  rosterSummary,
  validation,
  isActive,
  onAddPlayer,
  onRemovePlayer,
  onOpenPrediction,
  onSubmitTeam
}) => {
  return (
    <div className="team-builder-tab">
      {/* Team Overview */}
      <div className="team-overview">
        <div className="overview-card">
          <div className="card-header">
            <Shield size={24} />
            <h3>Team Status</h3>
          </div>
          <div className="card-content">
            <div className="status-grid">
              <div className="status-item">
                <span className="status-label">Starters</span>
                <span className="status-value">{rosterSummary.starters}/5</span>
              </div>
              <div className="status-item">
                <span className="status-label">Bench</span>
                <span className="status-value">{rosterSummary.bench}/3</span>
              </div>
              <div className="status-item">
                <span className="status-label">Predictions</span>
                <span className="status-value">{rosterSummary.predictions}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Team Ready</span>
                <span className={`status-value ${validation.isValid ? 'valid' : 'invalid'}`}>
                  {validation.isValid ? <CheckCircle size={16} /> : '❌'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Formation */}
      <div className="team-formation">
        <div className="formation-container">
          <div className="court-background">
            <div className="court-lines"></div>

            {/* Starters Section */}
            <div className="starters-section">
              <h4 className="section-title">
                <Star size={20} />
                Starting Lineup
              </h4>
              <div className="positions-grid starters">
                {['PG', 'SG', 'SF', 'PF', 'C'].map(position => (
                  <PositionSlot
                    key={position}
                    position={position}
                    player={currentRoster.starters[position]}
                    onAdd={() => onAddPlayer(position, 'starters')}
                    onRemove={(playerId) => onRemovePlayer(playerId, position, true)}
                    onPredict={onOpenPrediction}
                    isStarter={true}
                  />
                ))}
              </div>
            </div>

            {/* Bench Section */}
            <div className="bench-section">
              <h4 className="section-title">
                <Users size={20} />
                Bench Players
              </h4>
              <div className="positions-grid bench">
                {['BENCH1', 'BENCH2', 'BENCH3'].map((position, index) => (
                  <PositionSlot
                    key={position}
                    position={`BENCH ${index + 1}`}
                    player={currentRoster.bench[index]}
                    onAdd={() => onAddPlayer('BENCH', 'bench')}
                    onRemove={(playerId) => onRemovePlayer(playerId, 'BENCH', false)}
                    onPredict={onOpenPrediction}
                    isStarter={false}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Team */}
      {validation.isValid && isActive && (
        <div className="submit-section">
          <button className="submit-team-btn" onClick={onSubmitTeam}>
            <Trophy size={20} />
            Submit Team for Round
          </button>
        </div>
      )}
    </div>
  );
};

// Position Slot Component
const PositionSlot = ({ position, player, onAdd, onRemove, onPredict, isStarter }) => {
  return (
    <div className={`position-slot ${player ? 'filled' : 'empty'} ${isStarter ? 'starter' : 'bench'}`}>
      <div className="slot-header">
        <span className="position-label">{position}</span>
      </div>

      {player ? (
        <div className="player-card">
          <div className="player-avatar">
            <User size={32} />
          </div>
          <div className="player-info">
            <h5 className="player-name">{player.name}</h5>
            <span className="player-team">{player.team}</span>
            <div className="player-actions">
              <button
                className="action-btn predict"
                onClick={() => onPredict(player)}
                title="Add Prediction"
              >
                <Target size={14} />
              </button>
              <button
                className="action-btn remove"
                onClick={() => onRemove(player.id)}
                title="Remove Player"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-slot" onClick={onAdd}>
          <Plus size={32} />
          <span>Add Player</span>
        </div>
      )}
    </div>
  );
};

// Placeholder components for other tabs
const PlayerDraftTab = ({ positions, getPlayersByPosition, onSelectPlayer, currentRoster }) => (
  <div className="draft-tab">
    <h3>Player Draft - Coming Soon</h3>
    <p>Player selection interface will be available here.</p>
  </div>
);

const PredictionsTab = ({ currentRoster, getPlayerPredictions, onOpenPrediction }) => (
  <div className="predictions-tab">
    <h3>Player Predictions - Coming Soon</h3>
    <p>Manage your player performance predictions here.</p>
  </div>
);

const HistoryTab = ({ teamHistory, userTeams }) => (
  <div className="history-tab">
    <h3>Team History - Coming Soon</h3>
    <p>View your past team performances and results here.</p>
  </div>
);

// Modal Components (simplified for now)
const PlayerSelectionModal = ({ position, section, players, onSelect, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <h3>Select {position} Player</h3>
      <div className="players-list">
        {players.slice(0, 10).map(player => (
          <div key={player.id} className="player-option" onClick={() => onSelect(player)}>
            <span>{player.name}</span>
            <span>{player.team}</span>
          </div>
        ))}
      </div>
      <button onClick={onClose}>Close</button>
    </div>
  </div>
);

const PredictionModal = ({ player, onSubmit, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <h3>Predict: {player.name}</h3>
      <p>Prediction interface coming soon...</p>
      <button onClick={onClose}>Close</button>
    </div>
  </div>
);

export default MyTeam;