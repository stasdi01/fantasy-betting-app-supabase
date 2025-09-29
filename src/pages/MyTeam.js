import React, { useState, useEffect } from 'react';
import { User, Plus, Trash2, Trophy, Target, History, Edit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast/ToastProvider';
import { mockEuroLeaguePlayers, getPlayerOdds } from '../data/euroLeagueData';
import '../styles/MyTeam.css';

const MyTeam = () => {
  const { profile } = useAuth();
  const { success, error: showError } = useToast();

  // Team state - starting lineup + bench (10 players total)
  const [team, setTeam] = useState({
    starting: {
      PG: null,
      SG: null,
      SF: null,
      PF: null,
      C: null
    },
    bench: {
      PG: null,
      SG: null,
      SF: null,
      PF: null,
      C: null
    }
  });

  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null); // 'starting' or 'bench'
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [totalBudgetUsed, setTotalBudgetUsed] = useState(0);

  // View mode and saved teams
  const [viewMode, setViewMode] = useState('builder'); // 'builder' or 'teams'
  const [savedTeams, setSavedTeams] = useState([
    // Mock saved team for testing
    {
      id: 1,
      name: 'Team Alpha',
      status: 'active',
      createdAt: new Date(),
      team: {
        starting: {
          PG: { name: 'Luka Doncic', team: 'Real Madrid', prediction: { description: '25+ points', odds: 1.85 }, budget: 25 },
          SG: null,
          SF: null,
          PF: null,
          C: null
        },
        bench: {
          PG: null,
          SG: null,
          SF: null,
          PF: null,
          C: null
        }
      }
    }
  ]); // Mock saved teams for now

  // Get max teams allowed based on user role
  const getMaxTeams = () => {
    if (!profile) return 1;

    const isPremium = (profile.role === 'pro' || profile.role === 'max') &&
                     profile.premium_expires_at &&
                     new Date(profile.premium_expires_at) > new Date();

    switch (profile.role) {
      case 'free': return 1;
      case 'pro': return isPremium ? 3 : 1;
      case 'max': return isPremium ? 5 : 1;
      default: return 1;
    }
  };

  // Calculate total budget used
  useEffect(() => {
    const allPlayers = [...Object.values(team.starting), ...Object.values(team.bench)];
    const total = allPlayers.reduce((sum, player) => {
      return sum + (player?.budget || 0);
    }, 0);
    setTotalBudgetUsed(total);
  }, [team]);

  // Get used player IDs to prevent duplicates
  const getUsedPlayerIds = () => {
    const allPlayers = [...Object.values(team.starting), ...Object.values(team.bench)];
    return allPlayers.filter(Boolean).map(player => player.playerId);
  };

  // Handle position click to open player selection
  const handlePositionClick = (position, section) => {
    setSelectedPosition(position);
    setSelectedSection(section);
    setShowPlayerModal(true);
  };

  // Handle player selection with prediction
  const handlePlayerSelect = (player, predictionType, budget) => {
    if (budget <= 0 || budget > (100 - totalBudgetUsed)) {
      showError(`Invalid budget. Available: ${100 - totalBudgetUsed}%`);
      return;
    }

    const playerOdds = getPlayerOdds(player.id);
    const selectedPrediction = playerOdds[predictionType];

    const playerData = {
      playerId: player.id,
      name: player.name,
      team: player.team,
      position: player.position,
      prediction: {
        type: predictionType,
        threshold: selectedPrediction.threshold,
        odds: selectedPrediction.odds,
        description: getPredictionDescription(predictionType, selectedPrediction.threshold)
      },
      budget: budget
    };

    // Update team
    const newTeam = { ...team };
    newTeam[selectedSection][selectedPosition] = playerData;
    setTeam(newTeam);

    setShowPlayerModal(false);
    success(`${player.name} added to ${selectedPosition} position!`);
  };

  // Get prediction description
  const getPredictionDescription = (type, threshold) => {
    switch (type) {
      case 'points': return `${threshold}+ points`;
      case 'assists': return `${threshold}+ assists`;
      case 'rebounds': return `${threshold}+ rebounds`;
      default: return '';
    }
  };

  // Remove player from position
  const handleRemovePlayer = (section, position) => {
    const newTeam = { ...team };
    newTeam[section][position] = null;
    setTeam(newTeam);
    success('Player removed!');
  };

  // Check if team is complete
  const isTeamComplete = () => {
    const allPlayers = [...Object.values(team.starting), ...Object.values(team.bench)];
    return allPlayers.every(player => player !== null);
  };

  // Save team
  const handleSaveTeam = async () => {
    if (!isTeamComplete()) {
      showError('Please fill all positions before saving team!');
      return;
    }

    if (totalBudgetUsed !== 100) {
      showError(`You must use exactly 100% budget. Current: ${totalBudgetUsed}%`);
      return;
    }

    try {
      // Create saved team object
      const savedTeam = {
        id: Date.now(), // Simple ID for now
        name: `Team ${savedTeams.length + 1}`,
        createdAt: new Date(),
        team: { ...team },
        totalBudget: totalBudgetUsed,
        status: 'active' // active, finished, etc.
      };

      // Add to saved teams
      setSavedTeams(prev => [...prev, savedTeam]);

      // Here will be database save logic
      console.log('Saving team:', savedTeam);
      success('Team saved successfully!');
    } catch (error) {
      console.error('Error saving team:', error);
      showError('Error saving team.');
    }
  };

  // Clear entire team
  const handleClearTeam = () => {
    if (window.confirm('Are you sure you want to clear the entire team?')) {
      setTeam({
        starting: { PG: null, SG: null, SF: null, PF: null, C: null },
        bench: { PG: null, SG: null, SF: null, PF: null, C: null }
      });
      success('Team cleared!');
    }
  };

  const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
  const positionNames = {
    PG: 'Point Guard',
    SG: 'Shooting Guard',
    SF: 'Small Forward',
    PF: 'Power Forward',
    C: 'Center'
  };

  return (
    <div className="myteam-container">
      {/* Header */}
      <div className="myteam-header">
        <div className="header-content">
          <Trophy size={32} />
          <div>
            <h1>MyTeam EuroLeague</h1>
            <p>Build your team and make predictions</p>
          </div>
        </div>

        <div className="header-controls" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <div className="view-toggle" style={{ display: 'flex', gap: '0.5rem', background: '#0a0a0a', padding: '0.25rem', borderRadius: '12px', border: '1px solid #3f3f46' }}>
            <button
              className={`toggle-btn ${viewMode === 'builder' ? 'active' : ''}`}
              onClick={() => setViewMode('builder')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: viewMode === 'builder' ? '#8b5cf6' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: viewMode === 'builder' ? 'white' : '#a1a1aa',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <Edit size={16} />
              Team Builder
            </button>
            <button
              className={`toggle-btn ${viewMode === 'teams' ? 'active' : ''}`}
              onClick={() => setViewMode('teams')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: viewMode === 'teams' ? '#8b5cf6' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: viewMode === 'teams' ? 'white' : '#a1a1aa',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <History size={16} />
              Saved Teams ({savedTeams.length})
            </button>
          </div>

          <div className="team-stats">
            <div className="stat">
              <span className="stat-label">Budget:</span>
              <span className={`stat-value ${totalBudgetUsed === 100 ? 'complete' : ''}`}>
                {totalBudgetUsed}/100%
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Teams per round:</span>
              <span className="stat-value">{savedTeams.length}/{getMaxTeams()}</span>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'builder' ? (
        <div>
          <div className="team-builder">
            {/* Starting Lineup */}
            <div className="lineup-section">
              <h3><Target size={20} /> Starting Lineup</h3>
              <div className="positions-grid">
                {positions.map(position => (
                  <PositionCard
                    key={`starting-${position}`}
                    position={position}
                    positionName={positionNames[position]}
                    player={team.starting[position]}
                    onClick={() => handlePositionClick(position, 'starting')}
                    onRemove={() => handleRemovePlayer('starting', position)}
                  />
                ))}
              </div>
            </div>

            {/* Bench */}
            <div className="lineup-section">
              <h3><User size={20} /> Bench</h3>
              <div className="positions-grid">
                {positions.map(position => (
                  <PositionCard
                    key={`bench-${position}`}
                    position={position}
                    positionName={positionNames[position]}
                    player={team.bench[position]}
                    onClick={() => handlePositionClick(position, 'bench')}
                    onRemove={() => handleRemovePlayer('bench', position)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="team-actions">
            <button
              className="btn-secondary"
              onClick={handleClearTeam}
              disabled={totalBudgetUsed === 0}
            >
              <Trash2 size={18} />
              Clear Team
            </button>

            <button
              className="btn-primary"
              onClick={handleSaveTeam}
              disabled={!isTeamComplete() || totalBudgetUsed !== 100}
            >
              <Trophy size={18} />
              Save Team
            </button>
          </div>
        </div>
      ) : (
        <SavedTeamsView teams={savedTeams} />
      )}

      {/* Player Selection Modal */}
      {showPlayerModal && (
        <PlayerSelectionModal
          position={selectedPosition}
          section={selectedSection}
          usedPlayerIds={getUsedPlayerIds()}
          availableBudget={100 - totalBudgetUsed}
          onPlayerSelect={handlePlayerSelect}
          onClose={() => setShowPlayerModal(false)}
        />
      )}
    </div>
  );
};

// Position Card Component
const PositionCard = ({ position, positionName, player, onClick, onRemove }) => {
  return (
    <div className="position-card" onClick={player ? null : onClick}>
      <div className="position-header">
        <span className="position-name">{position}</span>
        {player && (
          <button
            className="remove-btn"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {player ? (
        <div className="player-info">
          <div className="player-name">{player.name}</div>
          <div className="player-team">{player.team}</div>
          <div className="player-prediction">
            {player.prediction.description} @ {player.prediction.odds}
          </div>
          <div className="player-budget">{player.budget}%</div>
        </div>
      ) : (
        <div className="empty-position">
          <Plus size={24} />
          <span>Add Player</span>
          <span className="position-desc">{positionName}</span>
        </div>
      )}
    </div>
  );
};

// Player Selection Modal Component
const PlayerSelectionModal = ({ position, section, usedPlayerIds, availableBudget, onPlayerSelect, onClose }) => {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [budget, setBudget] = useState(0);

  // Filter available players for this position
  const availablePlayers = mockEuroLeaguePlayers.filter(player =>
    player.position === position && !usedPlayerIds.includes(player.id)
  );

  const handleConfirm = () => {
    if (!selectedPlayer || !selectedPrediction || !budget) {
      return;
    }
    onPlayerSelect(selectedPlayer, selectedPrediction, budget);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Select Player - {position} ({section === 'starting' ? 'Starter' : 'Bench'})</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {!selectedPlayer ? (
            // Player Selection
            <div className="player-list">
              <p>Available budget: {availableBudget}%</p>
              {availablePlayers.map(player => (
                <div
                  key={player.id}
                  className="player-item"
                  onClick={() => setSelectedPlayer(player)}
                >
                  <div className="player-details">
                    <strong>{player.name}</strong>
                    <span>{player.team}</span>
                    <small>Average: {player.season_averages.points}p, {player.season_averages.assists}a, {player.season_averages.rebounds}r</small>
                  </div>
                </div>
              ))}
            </div>
          ) : !selectedPrediction ? (
            // Prediction Selection
            <div className="prediction-selection">
              <div className="selected-player">
                <strong>{selectedPlayer.name}</strong> ({selectedPlayer.team})
                <button onClick={() => setSelectedPlayer(null)}>Change</button>
              </div>

              <h4>Select prediction:</h4>
              <PredictionOptions
                player={selectedPlayer}
                onSelect={setSelectedPrediction}
              />
            </div>
          ) : (
            // Budget Selection
            <div className="budget-selection">
              <div className="selection-summary">
                <strong>{selectedPlayer.name}</strong> - {getPredictionDesc(selectedPrediction, selectedPlayer)}
                <button onClick={() => setSelectedPrediction(null)}>Change</button>
              </div>

              <div className="budget-input">
                <label>Budget (%):</label>
                <input
                  type="number"
                  min="1"
                  max={availableBudget}
                  value={budget}
                  onChange={e => setBudget(Number(e.target.value))}
                  placeholder={`1-${availableBudget}`}
                />
              </div>

              <button
                className="btn-primary"
                onClick={handleConfirm}
                disabled={!budget || budget > availableBudget}
              >
                Add Player
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Prediction Options Component
const PredictionOptions = ({ player, onSelect }) => {
  const odds = getPlayerOdds(player.id);

  return (
    <div className="prediction-options">
      <div className="prediction-option" onClick={() => onSelect('points')}>
        <div className="pred-label">Points {odds.points.threshold}+</div>
        <div className="pred-odds">{odds.points.odds}</div>
      </div>
      <div className="prediction-option" onClick={() => onSelect('assists')}>
        <div className="pred-label">Assists {odds.assists.threshold}+</div>
        <div className="pred-odds">{odds.assists.odds}</div>
      </div>
      <div className="prediction-option" onClick={() => onSelect('rebounds')}>
        <div className="pred-label">Rebounds {odds.rebounds.threshold}+</div>
        <div className="pred-odds">{odds.rebounds.odds}</div>
      </div>
    </div>
  );
};

// Helper function to get prediction description with player context
const getPredictionDesc = (predType, selectedPlayer) => {
  if (!selectedPlayer) return '';

  const odds = getPlayerOdds(selectedPlayer.id);
  switch(predType) {
    case 'points': return `${odds.points.threshold}+ points @ ${odds.points.odds}`;
    case 'assists': return `${odds.assists.threshold}+ assists @ ${odds.assists.odds}`;
    case 'rebounds': return `${odds.rebounds.threshold}+ rebounds @ ${odds.rebounds.odds}`;
    default: return '';
  }
};

// Saved Teams View Component
const SavedTeamsView = ({ teams }) => {
  if (teams.length === 0) {
    return (
      <div className="saved-teams-empty">
        <Trophy size={48} />
        <h3>No Saved Teams Yet</h3>
        <p>Create your first team using the Team Builder</p>
      </div>
    );
  }

  return (
    <div className="saved-teams-container" style={{ padding: '2rem' }}>
      <div className="teams-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {teams.map(team => (
          <SavedTeamCard key={team.id} team={team} />
        ))}
      </div>
    </div>
  );
};

// Saved Team Card Component
const SavedTeamCard = ({ team }) => {
  const { success } = useToast();

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = () => {
    success(`Viewing details for ${team.name}`);
    console.log('Team details:', team);
    // Ovde možete dodati logiku za otvaranje modala ili navigaciju
  };

  const getPlayerCount = () => {
    const allPlayers = [...Object.values(team.team.starting), ...Object.values(team.team.bench)];
    return allPlayers.filter(Boolean).length;
  };

  const getTotalBudgetUsed = () => {
    const allPlayers = [...Object.values(team.team.starting), ...Object.values(team.team.bench)];
    return allPlayers.reduce((sum, player) => sum + (player?.budget || 0), 0);
  };

  return (
    <div className="saved-team-card" style={{ background: '#18181b', borderRadius: '16px', padding: '1.5rem', border: '1px solid #3f3f46' }}>
      <div className="team-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, color: '#fafafa', fontSize: '1.2rem' }}>{team.name}</h4>
        <span className={`team-status ${team.status}`} style={{
          padding: '0.25rem 0.75rem',
          borderRadius: '20px',
          fontSize: '0.8rem',
          background: '#10b981',
          color: 'white'
        }}>{team.status}</span>
      </div>

      <div className="team-card-info" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div className="team-stat" style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="stat-label" style={{ color: '#a1a1aa', fontSize: '0.8rem' }}>Players:</span>
          <span className="stat-value" style={{ color: '#fafafa', fontWeight: 'bold' }}>{getPlayerCount()}/10</span>
        </div>
        <div className="team-stat" style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="stat-label" style={{ color: '#a1a1aa', fontSize: '0.8rem' }}>Budget Used:</span>
          <span className="stat-value" style={{ color: '#fafafa', fontWeight: 'bold' }}>{getTotalBudgetUsed()}%</span>
        </div>
        <div className="team-stat" style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="stat-label" style={{ color: '#a1a1aa', fontSize: '0.8rem' }}>Created:</span>
          <span className="stat-value" style={{ color: '#fafafa', fontWeight: 'bold' }}>{formatDate(team.createdAt)}</span>
        </div>
      </div>

      <div className="team-players-preview" style={{ marginBottom: '1rem' }}>
        <h5 style={{ color: '#fafafa', marginBottom: '0.5rem' }}>Starting Lineup:</h5>
        <div className="players-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {Object.entries(team.team.starting).map(([position, player]) => (
            <div key={position} className="player-preview" style={{ fontSize: '0.9rem' }}>
              {player ? (
                <span style={{ color: '#a1a1aa' }}>
                  <strong style={{ color: '#8b5cf6' }}>{position}:</strong> {player.name} - {player.prediction.description} ({player.budget}%)
                </span>
              ) : (
                <span style={{ color: '#71717a' }}><strong style={{ color: '#8b5cf6' }}>{position}:</strong> Empty</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="team-card-actions">
        <button
          className="btn-view"
          onClick={handleViewDetails}
          onMouseEnter={(e) => {
            e.target.style.background = '#8b5cf6';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = '#8b5cf6';
          }}
          style={{
            width: '100%',
            padding: '0.5rem 1rem',
            background: 'transparent',
            border: '1px solid #8b5cf6',
            borderRadius: '8px',
            color: '#8b5cf6',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
          View Details
        </button>
      </div>
    </div>
  );
};

export default MyTeam;