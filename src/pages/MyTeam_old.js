import React, { useState, useMemo, useCallback } from 'react';
import {
  Target, Users, Trophy, Plus, Star, Crown, Timer, Calendar,
  TrendingUp, Zap, Award, Clock, ChevronRight, User, Gamepad2,
  Shield, Diamond, Flame
} from 'lucide-react';
import { useMyTeam } from '../hooks/useMyTeam';
import { useAuth } from '../context/AuthContext';
import { positions } from '../data/euroLeagueData';
import LoadingSpinner from '../components/Loading/LoadingSpinner';
import '../styles/MyTeam.css';

const MyTeam = () => {
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
  const [activeTab, setActiveTab] = useState('team'); // 'team', 'draft', 'predictions', 'history'

  // Memoized computations
  const rosterSummary = useMemo(() => getRosterSummary(), [getRosterSummary]);
  const validation = useMemo(() => validateRoster(), [validateRoster]);
  const maxTeamsAllowed = useMemo(() => getMaxTeamsAllowed, [getMaxTeamsAllowed]);

  // Optimized event handlers with useCallback (must be called before early returns)
  const handleAddPlayer = useCallback((position, section) => {
    setSelectedPosition(position);
    setSelectedSection(section);
    setShowPlayerModal(true);
  }, []);

  const handleSelectPlayer = useCallback((player) => {
    const result = addPlayerToRoster(player, selectedPosition, selectedSection === 'starters');
    if (result.success) {
      setShowPlayerModal(false);
    } else {
      alert(result.error);
    }
  }, [addPlayerToRoster, selectedPosition, selectedSection]);

  const handleRemovePlayer = useCallback((position, section) => {
    removePlayerFromRoster(position, section === 'starters');
  }, [removePlayerFromRoster]);

  const handleAddPrediction = useCallback((player) => {
    setSelectedPlayer(player);
    setShowPredictionModal(true);
  }, []);

  const handleSubmitTeam = useCallback(async () => {
    const result = await submitTeam();

    if (result.success) {
      alert('Team submitted successfully! Your team is now locked for Round 1.');
    } else {
      alert('Failed to submit team:\n' + result.errors.join('\n'));
    }
  }, [submitTeam]);

  // Enhanced loading state with skeleton
  if (loading) {
    return (
      <div className="myteam-container">
        <div className="loading-skeleton">
          <div className="skeleton-header">
            <div className="skeleton-title"></div>
            <div className="skeleton-subtitle"></div>
            <div className="skeleton-budget"></div>
          </div>
          <div className="skeleton-formation">
            {positions.map((pos, index) => (
              <div key={pos.key} className="skeleton-position">
                <div className="skeleton-position-header"></div>
                <div className="skeleton-player-card"></div>
              </div>
            ))}
          </div>
          <div className="loading-spinner-overlay">
            <LoadingSpinner size="lg" />
            <p>Loading your team data...</p>
          </div>
        </div>
      </div>
    );
  }

  const renderPositionSlot = (position, section) => {
    const playerId = currentRoster[section][position];
    const player = playerId ? getPlayerById(playerId) : null;
    const hasPredictions = playerId && currentRoster.predictions[playerId];
    const isSubmitted = currentRoster.status === 'submitted';

    return (
      <div key={`${section}-${position}`} className={`position-slot ${player ? 'filled' : 'empty'} ${isSubmitted ? 'submitted' : ''}`}>
        <div className="position-header">
          <span className="position-label">{position}</span>
          <span className="section-label">{section === 'starters' ? 'Starter' : 'Bench'}</span>
          {isSubmitted && <span className="submitted-badge">🔒 Locked</span>}
        </div>

        {player ? (
          <div className="player-card">
            <div className="player-info">
              <h4 className="player-name">{player.name}</h4>
              <p className="player-team">{player.team}</p>
              <div className="player-stats">
                <span>PPG: {player.season_averages.points}</span>
                <span>APG: {player.season_averages.assists}</span>
                <span>RPG: {player.season_averages.rebounds}</span>
              </div>
            </div>

            <div className="player-actions">
              {hasPredictions && (
                <div className="predictions-badge">
                  <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                  <span>{Object.keys(currentRoster.predictions[playerId]).length} predictions</span>
                </div>
              )}

              {!isSubmitted && (
                <>
                  <button
                    className="action-btn prediction-btn"
                    onClick={() => handleAddPrediction(player)}
                  >
                    <Target size={16} />
                    Predict
                  </button>

                  <button
                    className="action-btn remove-btn"
                    onClick={() => handleRemovePlayer(position, section)}
                  >
                    <Minus size={16} />
                    Remove
                  </button>
                </>
              )}

              {isSubmitted && hasPredictions && (
                <button
                  className="action-btn view-btn"
                  onClick={() => handleAddPrediction(player)}
                >
                  <Target size={16} />
                  View Predictions
                </button>
              )}
            </div>
          </div>
        ) : (
          <div
            className={`empty-slot ${isSubmitted ? 'disabled' : ''}`}
            onClick={!isSubmitted ? () => handleAddPlayer(position, section) : undefined}
          >
            <Plus size={24} />
            <span>Add {position}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="myteam-container">
      {/* Header */}
      <div className="myteam-header">
        <div className="header-content">
          <div className="title-section">
            <Target size={32} style={{ color: 'var(--primary)' }} />
            <div>
              <h1>MyTeam League</h1>
              <p>Build your EuroLeague fantasy team and predict player performances</p>
            </div>
          </div>

          {/* Team Switcher */}
          {getMaxTeamsAllowed > 1 && (
            <div className="team-switcher">
              <label>Select Team:</label>
              <select
                value={selectedTeamIndex}
                onChange={(e) => switchTeam(parseInt(e.target.value))}
              >
                {userTeams.map((team, index) => (
                  <option key={index} value={index}>
                    {team.teamName || `Team ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Round Info */}
        <div className="round-info">
          <div className="round-details">
            <h3>
              <Calendar size={20} />
              Round {currentRound.round_number} - EuroLeague {currentRound.season_year}/25
            </h3>
            <div className="round-status">
              <span className={`status-badge ${currentRound.status}`}>
                {getRoundStatus(currentRound)}
              </span>
              {isRoundActive(currentRound) && (
                <span className="deadline-info">
                  ⏰ {getTimeUntilDeadline(currentRound)}
                </span>
              )}
            </div>
            <p>
              Round period: {new Date(currentRound.start_date).toLocaleDateString()} - {new Date(currentRound.end_date).toLocaleDateString()}
              <br />
              Submission deadline: {new Date(currentRound.submission_deadline).toLocaleString()}
            </p>
          </div>

          {/* Team Limits Info */}
          <div className="team-limits-info">
            <div className="limits-badge">
              <Users size={16} />
              <span>
                {getMaxTeamsAllowed === 999 ? 'Unlimited' : getMaxTeamsAllowed} team{getMaxTeamsAllowed !== 1 ? 's' : ''} allowed
              </span>
            </div>
            {userTeams.length > 1 && (
              <small>Managing team {selectedTeamIndex + 1} of {userTeams.length}</small>
            )}
          </div>
        </div>
      </div>

      {/* Roster Summary */}
      <div className="roster-summary">
        <div className="summary-stats">
          <div className="stat-item">
            <Users size={20} />
            <div>
              <span className="stat-value">{rosterSummary.playersSelected}/10</span>
              <span className="stat-label">Players</span>
            </div>
          </div>
          <div className="stat-item">
            <Target size={20} />
            <div>
              <span className="stat-value">{rosterSummary.totalPredictions}</span>
              <span className="stat-label">Predictions</span>
            </div>
          </div>
          <div className="stat-item">
            <DollarSign size={20} />
            <div>
              <span className="stat-value">{rosterSummary.budgetUsed.toFixed(1)}%</span>
              <span className="stat-label">Budget Used</span>
            </div>
          </div>
          <div className="stat-item">
            <Trophy size={20} />
            <div>
              <span className={`stat-value ${validation.isValid ? 'success' : 'danger'}`}>
                {validation.isValid ? 'Ready' : 'Incomplete'}
              </span>
              <span className="stat-label">Status</span>
            </div>
          </div>
        </div>

        {!validation.isValid && (
          <div className="validation-errors">
            <AlertCircle size={16} style={{ color: 'var(--danger)' }} />
            <div>
              {validation.errors.map((error, index) => (
                <p key={index} className="error-message">{error}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Team Formation */}
      <div className="team-formation">
        <div className="formation-section">
          <h3>Starting Lineup</h3>
          <div className="positions-grid">
            {positions.map(pos => renderPositionSlot(pos.key, 'starters'))}
          </div>
        </div>

        <div className="formation-section">
          <h3>Bench</h3>
          <div className="positions-grid">
            {positions.map(pos => renderPositionSlot(pos.key, 'bench'))}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="submit-section">
        {currentRoster.status === 'submitted' ? (
          <div className="submitted-status">
            <CheckCircle size={24} style={{ color: 'var(--success)' }} />
            <div>
              <h3>Team Submitted!</h3>
              <p>Your team was submitted on {new Date(currentRoster.submittedAt).toLocaleDateString()} at {new Date(currentRoster.submittedAt).toLocaleTimeString()}</p>
              <p>Team is locked for Round {currentRound.round_number}. Results will be available after the round ends.</p>
            </div>
          </div>
        ) : (
          <>
            {!isRoundActive(currentRound) ? (
              <div className="deadline-passed">
                <AlertCircle size={24} style={{ color: 'var(--warning)' }} />
                <div>
                  <h3>Submission Period Ended</h3>
                  <p>The deadline for Round {currentRound.round_number} has passed. Team submissions are no longer accepted.</p>
                  <p>You can still build your team for upcoming rounds.</p>
                </div>
              </div>
            ) : (
              <>
                <button
                  className={`submit-btn ${validation.isValid && isRoundActive(currentRound) ? 'ready' : 'disabled'}`}
                  disabled={!validation.isValid || !isRoundActive(currentRound)}
                  onClick={handleSubmitTeam}
                >
                  Submit Team for Round {currentRound.round_number}
                </button>
                <p className="submit-note">
                  Once submitted, your team will be locked for this round.
                  {isRoundActive(currentRound) && (
                    <><br /><strong>⏰ {getTimeUntilDeadline(currentRound)}</strong></>
                  )}
                </p>
              </>
            )}
          </>
        )}
      </div>

      {/* Team History Section */}
      {teamHistory.length > 0 && (
        <div className="team-history-section">
          <div className="history-header">
            <h3>
              <History size={24} style={{ color: 'var(--primary)' }} />
              Team History ({teamHistory.length})
            </h3>
            <button
              className="toggle-history-btn"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? 'Hide History' : 'Show History'}
            </button>
          </div>

          {showHistory && (
            <div className="history-teams-grid">
              {teamHistory.map((historicalTeam) => (
                <div key={historicalTeam.id} className="history-team-card">
                  <div className="history-team-header">
                    <h4>{historicalTeam.teamName}</h4>
                    <div className="history-team-meta">
                      <span className="round-badge">
                        <Calendar size={14} />
                        {historicalTeam.roundId}
                      </span>
                      <span className="submitted-date">
                        {new Date(historicalTeam.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="history-team-lineup">
                    <div className="lineup-section">
                      <h5>Starters</h5>
                      <div className="lineup-players">
                        {Object.entries(historicalTeam.starters).map(([position, playerId]) => {
                          const player = playerId ? getPlayerById(playerId) : null;
                          return (
                            <div key={`starter-${position}`} className="lineup-player">
                              <span className="player-position">{position}</span>
                              <span className="player-name">
                                {player ? player.name : 'Empty'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="lineup-section">
                      <h5>Bench</h5>
                      <div className="lineup-players">
                        {Object.entries(historicalTeam.bench).map(([position, playerId]) => {
                          const player = playerId ? getPlayerById(playerId) : null;
                          return (
                            <div key={`bench-${position}`} className="lineup-player">
                              <span className="player-position">{position}</span>
                              <span className="player-name">
                                {player ? player.name : 'Empty'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="history-team-stats">
                    <div className="stat-item">
                      <Target size={16} />
                      <span>{Object.keys(historicalTeam.predictions).length} predictions</span>
                    </div>
                    <div className="stat-item">
                      <DollarSign size={16} />
                      <span>{historicalTeam.totalBudgetUsed.toFixed(1)}% budget</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Player Selection Modal */}
      {showPlayerModal && (
        <PlayerSelectionModal
          position={selectedPosition}
          availablePlayers={getPlayersByPosition(selectedPosition)}
          onSelect={handleSelectPlayer}
          onClose={() => setShowPlayerModal(false)}
        />
      )}

      {/* Prediction Modal */}
      {showPredictionModal && selectedPlayer && (
        <PredictionModal
          player={selectedPlayer}
          currentPredictions={currentRoster.predictions[selectedPlayer.id] || {}}
          onAddPrediction={addPlayerPrediction}
          onRemovePrediction={removePlayerPrediction}
          onClose={() => setShowPredictionModal(false)}
          getPlayerPredictions={getPlayerPredictions}
        />
      )}
    </div>
  );
};

// Player Selection Modal Component
const PlayerSelectionModal = ({ position, availablePlayers, onSelect, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Select {position}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="players-list">
          {availablePlayers.map(player => (
            <div key={player.id} className="player-option" onClick={() => onSelect(player)}>
              <div className="player-info">
                <h4>{player.name}</h4>
                <p>{player.team} • {player.nationality}</p>
                <div className="player-stats">
                  <span>{player.season_averages.points} PPG</span>
                  <span>{player.season_averages.assists} APG</span>
                  <span>{player.season_averages.rebounds} RPG</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Prediction Modal Component
const PredictionModal = ({ player, currentPredictions, onAddPrediction, onRemovePrediction, onClose, getPlayerPredictions }) => {
  const [selectedStat, setSelectedStat] = useState('points');
  const [prediction, setPrediction] = useState('over');
  const [stake, setStake] = useState(10);

  const playerPreds = getPlayerPredictions(player.id);
  if (!playerPreds) return null;

  const handleAddPrediction = () => {
    const result = onAddPrediction(player.id, selectedStat, prediction, stake);
    if (result.success) {
      onClose();
    } else {
      alert(result.error);
    }
  };

  const statOptions = [
    { key: 'points', label: 'Points', line: playerPreds.points_line, overOdds: playerPreds.points_over_odds, underOdds: playerPreds.points_under_odds },
    { key: 'assists', label: 'Assists', line: playerPreds.assists_line, overOdds: playerPreds.assists_over_odds, underOdds: playerPreds.assists_under_odds },
    { key: 'rebounds', label: 'Rebounds', line: playerPreds.rebounds_line, overOdds: playerPreds.rebounds_over_odds, underOdds: playerPreds.rebounds_under_odds }
  ];

  const currentStat = statOptions.find(s => s.key === selectedStat);
  const currentOdds = prediction === 'over' ? currentStat.overOdds : currentStat.underOdds;
  const potentialWin = stake * currentOdds;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content prediction-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Predict: {player.name}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="prediction-form">
          <div className="stat-selection">
            <label>Statistic:</label>
            <select value={selectedStat} onChange={e => setSelectedStat(e.target.value)}>
              {statOptions.map(stat => (
                <option key={stat.key} value={stat.key}>
                  {stat.label} (Line: {stat.line.toFixed(1)})
                </option>
              ))}
            </select>
          </div>

          <div className="prediction-selection">
            <label>Prediction:</label>
            <div className="prediction-options">
              <button
                className={`prediction-option ${prediction === 'over' ? 'selected' : ''}`}
                onClick={() => setPrediction('over')}
              >
                Over {currentStat.line.toFixed(1)} (Odds: {currentStat.overOdds.toFixed(2)})
              </button>
              <button
                className={`prediction-option ${prediction === 'under' ? 'selected' : ''}`}
                onClick={() => setPrediction('under')}
              >
                Under {currentStat.line.toFixed(1)} (Odds: {currentStat.underOdds.toFixed(2)})
              </button>
            </div>
          </div>

          <div className="stake-selection">
            <label>Stake (%):</label>
            <input
              type="number"
              min="1"
              max="50"
              value={stake}
              onChange={e => setStake(Number(e.target.value))}
            />
          </div>

          <div className="prediction-summary">
            <p><strong>Potential Win:</strong> {potentialWin.toFixed(2)}%</p>
            <p><strong>Net Profit:</strong> +{(potentialWin - stake).toFixed(2)}%</p>
          </div>

          <div className="current-predictions">
            <h4>Current Predictions:</h4>
            {Object.entries(currentPredictions).length === 0 ? (
              <p>No predictions yet</p>
            ) : (
              Object.entries(currentPredictions).map(([stat, pred]) => (
                <div key={stat} className="current-prediction">
                  <span>{stat}: {pred.prediction} ({pred.stake}%)</span>
                  <button onClick={() => onRemovePrediction(player.id, stat)}>Remove</button>
                </div>
              ))
            )}
          </div>

          <div className="modal-actions">
            <button className="add-prediction-btn" onClick={handleAddPrediction}>
              Add Prediction
            </button>
            <button className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTeam;