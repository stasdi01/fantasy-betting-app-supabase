import React, { useState, useMemo, useCallback } from 'react';
import {
  Target, Users, Trophy, Plus, Star, Crown, Timer, Calendar,
  TrendingUp, Zap, Award, Clock, ChevronRight, User, Gamepad2,
  Shield, Diamond, Flame, Trash2, Edit3, CheckCircle
} from 'lucide-react';
import { useMyTeam } from '../hooks/useMyTeam';
import { useAuth } from '../context/AuthContext';
import { positions, getPlayerById } from '../data/euroLeagueData';
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
    removePlayerFromRoster(position, isStarter);
  }, [removePlayerFromRoster]);

  const handleClearTeam = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the entire team? This action cannot be undone.')) {
      // Remove all starters
      ['PG', 'SG', 'SF', 'PF', 'C'].forEach(position => {
        removePlayerFromRoster(position, true);
      });
      // Remove all bench players
      ['PG', 'SG', 'SF', 'PF', 'C'].forEach(position => {
        removePlayerFromRoster(position, false);
      });
    }
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
            selectedTeamIndex={selectedTeamIndex}
            onAddPlayer={handleAddPlayer}
            onRemovePlayer={handleRemovePlayer}
            onOpenPrediction={handleOpenPrediction}
            onSubmitTeam={submitTeam}
            onClearTeam={handleClearTeam}
            removePlayerPrediction={removePlayerPrediction}
            getPlayerById={getPlayerById}
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
          currentRoster={currentRoster}
          onSubmit={(predictionData) => {
            const result = addPlayerPrediction(
              predictionData.playerId,
              predictionData.statType,
              predictionData.prediction,
              predictionData.stakeAmount
            );

            if (result.success) {
              setShowPredictionModal(false);
            } else {
              alert(result.error);
            }
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
  selectedTeamIndex,
  onAddPlayer,
  onRemovePlayer,
  onOpenPrediction,
  onSubmitTeam,
  onClearTeam,
  removePlayerPrediction,
  getPlayerById
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
                <span className="status-label">Početna Postava</span>
                <span className="status-value">{rosterSummary.starters}/5</span>
              </div>
              <div className="status-item">
                <span className="status-label">Klupa</span>
                <span className="status-value">{rosterSummary.bench}/5</span>
              </div>
              <div className="status-item">
                <span className="status-label">Predikcije</span>
                <span className="status-value">{rosterSummary.predictions}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Preostalo Budžeta</span>
                <span className="status-value">{(() => {
                  const usedBudget = currentRoster.predictions ?
                    Object.values(currentRoster.predictions)
                      .flat()
                      .reduce((sum, predictions) => {
                        return sum + Object.values(predictions).reduce((predSum, pred) => predSum + pred.stakeAmount, 0);
                      }, 0) : 0;
                  return `${100 - usedBudget}%`;
                })()}</span>
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
                    player={currentRoster.starters[position] ? getPlayerById(currentRoster.starters[position]) : null}
                    onAdd={() => onAddPlayer(position, 'starters')}
                    onRemove={() => onRemovePlayer(null, position, true)}
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
                {['PG', 'SG', 'SF', 'PF', 'C'].map((position) => (
                  <PositionSlot
                    key={`bench-${position}`}
                    position={`${position} (Bench)`}
                    player={currentRoster.bench[position] ? getPlayerById(currentRoster.bench[position]) : null}
                    onAdd={() => onAddPlayer(position, 'bench')}
                    onRemove={() => onRemovePlayer(null, position, false)}
                    onPredict={onOpenPrediction}
                    isStarter={false}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Predictions Display */}
      {currentRoster.predictions && Object.keys(currentRoster.predictions).length > 0 && (
        <div className="predictions-display-section">
          <div className="card-header">
            <Target size={24} />
            <h3>Aktivne Predikcije</h3>
          </div>
          <div className="card-content">
            <div className="predictions-grid">
              {Object.entries(currentRoster.predictions).map(([playerId, playerPredictions]) => {
                const player = getPlayerById(playerId);
                if (!player) return null;

                return Object.entries(playerPredictions).map(([statType, predictionData]) => {
                  const statLabels = {
                    'points': 'Poeni',
                    'assists': 'Asistencije',
                    'rebounds': 'Skokovi'
                  };

                  return (
                    <div key={`${playerId}-${statType}`} className="prediction-display-card">
                      <div className="prediction-player-info">
                        <span className="player-name">{player.name}</span>
                        <span className="player-position">{player.position} • {player.team}</span>
                      </div>
                      <div className="prediction-details">
                        <span className="stat-type">{statLabels[statType]}</span>
                        <span className="threshold">{predictionData.threshold}</span>
                        <span className="stake">{predictionData.stakeAmount}%</span>
                      </div>
                      <button
                        className="remove-prediction-btn"
                        onClick={() => {
                          if (window.confirm(`Ukloniti predikciju za ${player.name} (${statLabels[statType]})?`)) {
                            removePlayerPrediction(playerId, statType);
                          }
                        }}
                        title="Ukloni predikciju"
                      >
                        ×
                      </button>
                    </div>
                  );
                });
              })}
            </div>
          </div>
        </div>
      )}

      {/* Team Actions */}
      <div className="team-actions-section">
        <button
          className={`submit-team-btn ${!validation.isValid ? 'disabled' : ''}`}
          onClick={validation.isValid ? onSubmitTeam : () => alert('Molimo popunite celokupan tim pre submit-a')}
        >
          <Trophy size={20} />
          Sacuvaj Tim
        </button>

        <button
          className="clear-team-btn"
          onClick={onClearTeam}
        >
          <Trash2 size={20} />
          Obriši Tim
        </button>
      </div>
    </div>
  );
};

// Position Slot Component
const PositionSlot = ({ position, player, onAdd, onRemove, onPredict, isStarter }) => {
  // Extract position code (remove "(Bench)" suffix if present)
  const positionCode = position.includes('(') ? position.split(' ')[0] : position;

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
                <Target size={12} />
                <span>Predict</span>
              </button>
              <button
                className="action-btn remove"
                onClick={() => onRemove(null, positionCode, isStarter)}
                title="Remove Player"
              >
                <Trash2 size={12} />
                <span>Remove</span>
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

const PredictionsTab = ({ currentRoster, getPlayerPredictions, onOpenPrediction }) => {
  const predictions = currentRoster.predictions || {};
  const predictionEntries = Object.entries(predictions);

  if (predictionEntries.length === 0) {
    return (
      <div className="predictions-tab">
        <div className="empty-predictions">
          <Target size={48} className="empty-icon" />
          <h3>Nema Predikcija</h3>
          <p>Dodajte igrače u tim i kliknite "Predict" dugme da napravite predikcije učinka.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="predictions-tab">
      <div className="predictions-header">
        <h3>Vaše Predikcije</h3>
        <p>Pratite svoje predikcije učinka igrača i ulogove</p>
      </div>

      <div className="predictions-list">
        {predictionEntries.map(([playerId, playerPredictions]) => {
          const player = getPlayerById(playerId);
          if (!player) return null;

          return (
            <div key={playerId} className="prediction-card">
              <div className="prediction-player">
                <div className="player-avatar">
                  <User size={20} />
                </div>
                <div className="player-info">
                  <span className="player-name">{player.name}</span>
                  <span className="player-position">{player.position} • {player.team}</span>
                </div>
              </div>

              <div className="predictions-details">
                {Object.entries(playerPredictions).map(([statType, predictionData]) => {
                  // Map stat types to Serbian labels
                  const statLabels = {
                    'points': 'Poeni',
                    'assists': 'Asistencije',
                    'rebounds': 'Skokovi'
                  };

                  return (
                    <div key={statType} className="prediction-item">
                      <div className="prediction-stat">
                        <span className="stat-label">{statLabels[statType] || statType}</span>
                        <span className="prediction-value">{predictionData.threshold || predictionData.prediction}</span>
                      </div>
                      <div className="prediction-stake">
                        <span className="stake-amount">{predictionData.stakeAmount}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                className="add-prediction-btn"
                onClick={() => onOpenPrediction(player)}
                title="Add more predictions"
              >
                <Plus size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const HistoryTab = ({ teamHistory, userTeams }) => (
  <div className="history-tab">
    <h3>Team History - Coming Soon</h3>
    <p>View your past team performances and results here.</p>
  </div>
);

// Mock opponent data for current round
const getOpponent = (teamName) => {
  const matchups = {
    'Real Madrid': 'Barcelona',
    'Barcelona': 'Real Madrid',
    'Fenerbahçe': 'Olympiacos',
    'Olympiacos': 'Fenerbahçe',
    'Panathinaikos': 'CSKA Moscow',
    'CSKA Moscow': 'Panathinaikos',
    'Anadolu Efes': 'Zalgiris',
    'Zalgiris': 'Anadolu Efes',
    'Bayern Munich': 'Red Star',
    'Red Star': 'Bayern Munich',
    'ALBA Berlin': 'Virtus Bologna',
    'Virtus Bologna': 'ALBA Berlin',
    'Monaco': 'Baskonia',
    'Baskonia': 'Monaco',
    'Maccabi Tel Aviv': 'ASVEL',
    'ASVEL': 'Maccabi Tel Aviv',
    'Paris Basketball': 'Partizan',
    'Partizan': 'Paris Basketball'
  };
  return matchups[teamName] || 'TBD';
};

// Modal Components - Improved Design
const PlayerSelectionModal = ({ position, section, players, onSelect, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content player-selection-modal" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <div className="header-main">
          <h3>Select {position}</h3>
          <span className="section-badge">{section === 'starters' ? 'Starting Lineup' : 'Bench'}</span>
        </div>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>

      <div className="players-grid">
        {players.map(player => (
          <div key={player.id} className="player-card-compact" onClick={() => onSelect(player)}>
            <div className="player-header">
              <div className="player-avatar-mini">
                <User size={20} />
              </div>
              <div className="player-basic">
                <span className="player-name">{player.name}</span>
                <span className="player-position-badge">{player.position}</span>
              </div>
            </div>

            <div className="player-teams">
              <div className="team-info">
                <span className="team-name">{player.team}</span>
                <span className="vs-indicator">vs</span>
                <span className="opponent">{getOpponent(player.team)}</span>
              </div>
            </div>

            <div className="player-stats-compact">
              <div className="stat-item">
                <span className="stat-value">{player.season_averages.points.toFixed(1)}</span>
                <span className="stat-label">PTS</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{player.season_averages.assists.toFixed(1)}</span>
                <span className="stat-label">AST</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{player.season_averages.rebounds.toFixed(1)}</span>
                <span className="stat-label">REB</span>
              </div>
            </div>

            <div className="nationality-flag">
              <span>{player.nationality}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="modal-footer">
        <button className="cancel-btn" onClick={onClose}>Cancel</button>
      </div>
    </div>
  </div>
);

const PredictionModal = ({ player, onSubmit, onClose, currentRoster }) => {
  const [selectedStat, setSelectedStat] = useState('points');
  const [stakeAmount, setStakeAmount] = useState(5);

  // Calculate remaining budget
  const usedBudget = currentRoster.predictions ?
    Object.values(currentRoster.predictions)
      .flat()
      .reduce((sum, predictions) => {
        return sum + Object.values(predictions).reduce((predSum, pred) => predSum + pred.stakeAmount, 0);
      }, 0) : 0;

  const remainingBudget = 100 - usedBudget;
  const maxStakeForPlayer = Math.min(55, remainingBudget);

  const statOptions = [
    { key: 'points', label: 'Poeni', threshold: '15+', unit: 'pts' },
    { key: 'assists', label: 'Asistencije', threshold: '5+', unit: 'ast' },
    { key: 'rebounds', label: 'Skokovi', threshold: '8+', unit: 'reb' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (stakeAmount < 5) {
      alert('Minimum ulog je 5%');
      return;
    }

    if (stakeAmount > maxStakeForPlayer) {
      alert(`Maksimum ulog po igraču je ${maxStakeForPlayer}%`);
      return;
    }

    if (stakeAmount > remainingBudget) {
      alert(`Nemate dovoljno budžeta. Preostalo: ${remainingBudget}%`);
      return;
    }

    // Get the threshold value for the selected stat
    const selectedOption = statOptions.find(s => s.key === selectedStat);
    const thresholdValue = parseFloat(selectedOption.threshold);

    onSubmit({
      playerId: player.id,
      statType: selectedStat,
      prediction: thresholdValue,
      threshold: selectedOption.threshold,
      stakeAmount: stakeAmount
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content prediction-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Predikcija: {player.name}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="player-info">
          <div className="player-avatar">
            <User size={24} />
          </div>
          <div className="player-details">
            <span className="player-name">{player.name}</span>
            <span className="player-position">{player.position}</span>
            <span className="player-team">{player.team}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="prediction-form">
          <div className="form-group">
            <label>Izaberite statistiku za predikciju:</label>
            <div className="stat-options">
              {statOptions.map(stat => (
                <label key={stat.key} className="stat-option">
                  <input
                    type="radio"
                    name="statType"
                    value={stat.key}
                    checked={selectedStat === stat.key}
                    onChange={(e) => setSelectedStat(e.target.value)}
                  />
                  <div className="stat-card">
                    <span className="stat-label">{stat.label}</span>
                    <span className="stat-threshold">{stat.threshold}</span>
                    <span className="stat-description">
                      Igrac će imati {stat.threshold} {stat.unit}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Budžet za ulog:</label>
            <div className="budget-info">
              <small>Preostalo: {remainingBudget}% | Max po igraču: {maxStakeForPlayer}%</small>
            </div>
            <div className="stake-input-group">
              <input
                type="number"
                step="1"
                min="5"
                max={maxStakeForPlayer}
                value={stakeAmount}
                onChange={(e) => setStakeAmount(parseFloat(e.target.value))}
                className="stake-input"
                required
              />
              <span className="input-unit">%</span>
            </div>
            <small className="stake-hint">Minimum 5%, maksimum {maxStakeForPlayer}% po igraču</small>
          </div>

          <div className="prediction-summary">
            <div className="summary-item">
              <span>Igrač:</span>
              <span>{player.name}</span>
            </div>
            <div className="summary-item">
              <span>Predikcija:</span>
              <span>{statOptions.find(s => s.key === selectedStat)?.threshold} {statOptions.find(s => s.key === selectedStat)?.unit}</span>
            </div>
            <div className="summary-item">
              <span>Ulog:</span>
              <span>{stakeAmount}%</span>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Odustani
            </button>
            <button type="submit" className="submit-btn">
              <Target size={16} />
              Dodaj Predikciju
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyTeam;