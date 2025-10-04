import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBudget } from './useBudget';
import { supabase } from '../lib/supabase';
import { logError } from '../utils/errorHandler';
import {
  mockEuroLeaguePlayers,
  mockPlayerRoundPredictions,
  getCurrentEuroLeagueRound,
  euroLeagueRounds,
  emptyRoster,
  getPlayersByPosition
} from '../data/euroLeagueData';

export const useMyTeam = (leagueId = null) => {
  const { user, profile } = useAuth();
  const { getAvailableBudget, canPlaceTicket, updateProfit } = useBudget();

  const [loading, setLoading] = useState(true);
  const [currentRoster, setCurrentRoster] = useState(emptyRoster);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [playerPredictions, setPlayerPredictions] = useState({});
  const [currentRound] = useState(getCurrentEuroLeagueRound());
  const [availableRounds] = useState(euroLeagueRounds);
  const [userTeams, setUserTeams] = useState([]);
  const [selectedTeamIndex, setSelectedTeamIndex] = useState(0);
  const [teamHistory, setTeamHistory] = useState([]);

  // Get max teams allowed based on user role (updated for new FREE/PRO/MAX structure)
  const getMaxTeamsAllowed = useCallback(() => {
    if (!profile) return 1;

    const isPremium = (profile.role === 'pro' || profile.role === 'max') &&
                     profile.premium_expires_at &&
                     new Date(profile.premium_expires_at) > new Date();

    switch (profile.role) {
      case 'free':
        return 1; // FREE users: 1 team per MyTeam League
      case 'pro':
        return isPremium ? 3 : 1; // PRO users: 3 teams per MyTeam League (if subscription active)
      case 'max':
        return isPremium ? 999 : 1; // MAX users: unlimited teams per MyTeam League (if subscription active)
      default:
        return 1;
    }
  }, [profile]);

  // Initialize teams based on user's subscription
  const initializeTeams = useCallback(() => {
    const maxTeams = getMaxTeamsAllowed();
    const teams = [];

    for (let i = 0; i < maxTeams && i < 3; i++) { // Limit to 3 for UI purposes
      teams.push({
        ...emptyRoster,
        teamName: `Team ${i + 1}`,
        id: `team_${i + 1}`
      });
    }

    setUserTeams(teams);
    setCurrentRoster(teams[0] || emptyRoster);
  }, [getMaxTeamsAllowed]);

  // Load players from database
  const loadPlayers = useCallback(async () => {
    console.log('🔄 Loading players from database...');
    try {
      // Fetch all EuroLeague players
      const { data: players, error: playersError } = await supabase
        .from('euroleague_players')
        .select('*')
        .order('name');

      console.log('📡 Database response:', { players: players?.length, error: playersError });

      if (playersError) {
        console.error('❌ Error loading players:', playersError);
        logError(playersError, 'useMyTeam.loadPlayers');
        // Fallback to mock data if database fails
        console.warn('⚠️  Falling back to mock data');
        setAvailablePlayers(mockEuroLeaguePlayers);
        return;
      }

      // Transform database players to match expected format
      const transformedPlayers = players?.map(player => ({
        id: player.id,
        name: player.name,
        team: player.team,
        teamId: player.team_id,
        position: player.position,
        nationality: player.nationality,
        photo: player.photo_url,
        stats: player.season_averages
      })) || [];

      setAvailablePlayers(transformedPlayers);

      // Fetch player round lines for current round
      const { data: lines, error: linesError } = await supabase
        .from('player_round_lines')
        .select('*')
        .eq('round_id', currentRound.id);

      if (linesError) {
        console.error('Error loading player lines:', linesError);
        logError(linesError, 'useMyTeam.loadPlayerLines');
        setPlayerPredictions(mockPlayerRoundPredictions);
        return;
      }

      // Transform lines to predictions format
      const predictions = {};
      lines?.forEach(line => {
        if (!predictions[line.player_id]) {
          predictions[line.player_id] = {};
        }
        predictions[line.player_id][line.stat] = {
          line: line.line,
          odds: line.over_odds
        };
      });

      setPlayerPredictions(predictions);

      console.log(`✅ Loaded ${transformedPlayers.length} players and ${lines?.length || 0} prop lines from database`);
    } catch (error) {
      console.error('Error in loadPlayers:', error);
      logError(error, 'useMyTeam.loadPlayers');
      // Fallback to mock data
      setAvailablePlayers(mockEuroLeaguePlayers);
      setPlayerPredictions(mockPlayerRoundPredictions);
    }
  }, [currentRound.id]);

  // Load user's saved teams from database
  const loadUserTeams = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch all teams for current round (both draft and submitted)
      let query = supabase
        .from('myteam_rosters')
        .select(`
          *,
          myteam_player_predictions (*)
        `)
        .eq('user_id', user.id)
        .eq('round_id', currentRound.id);

      // Handle league_id properly - if leagueId is null, filter for NULL values
      if (leagueId) {
        query = query.eq('league_id', leagueId);
      } else {
        query = query.is('league_id', null);
      }

      const { data: submittedRosters, error: rostersError } = await query;

      if (rostersError) {
        console.error('Error loading teams:', rostersError);
        logError(rostersError, 'useMyTeam.loadUserTeams');
      }

      console.log('Loaded teams from database:', submittedRosters);
      console.log('Number of teams found:', submittedRosters?.length || 0);

      const maxTeams = getMaxTeamsAllowed();
      const teams = [];

      // Convert rosters (both draft and submitted) back to our format
      if (submittedRosters && submittedRosters.length > 0) {
        submittedRosters.forEach((roster, index) => {
          // Reconstruct predictions object
          const predictions = {};
          if (roster.myteam_player_predictions) {
            roster.myteam_player_predictions.forEach(pred => {
              if (!predictions[pred.player_id]) {
                predictions[pred.player_id] = {};
              }

              // Add each stat prediction
              if (pred.points_prediction) {
                predictions[pred.player_id].points = {
                  prediction: pred.points_prediction,
                  stake: pred.points_stake || 0
                };
              }
              if (pred.assists_prediction) {
                predictions[pred.player_id].assists = {
                  prediction: pred.assists_prediction,
                  stake: pred.assists_stake || 0
                };
              }
              if (pred.rebounds_prediction) {
                predictions[pred.player_id].rebounds = {
                  prediction: pred.rebounds_prediction,
                  stake: pred.rebounds_stake || 0
                };
              }
            });
          }

          teams.push({
            id: roster.id,
            teamName: roster.team_name,
            status: roster.status,
            rosterId: roster.id,
            submittedAt: roster.created_at,
            createdAt: roster.created_at,
            starters: {
              PG: roster.pg_starter,
              SG: roster.sg_starter,
              SF: roster.sf_starter,
              PF: roster.pf_starter,
              C: roster.c_starter
            },
            bench: {
              PG: roster.pg_bench,
              SG: roster.sg_bench,
              SF: roster.sf_bench,
              PF: roster.pf_bench,
              C: roster.c_bench
            },
            predictions,
            totalBudgetUsed: roster.total_budget_used || 0
          });
        });
      }

      // Fill remaining slots with empty teams if user can have more
      while (teams.length < maxTeams && teams.length < 3) {
        teams.push({
          ...emptyRoster,
          teamName: `Team ${teams.length + 1}`,
          id: `team_${teams.length + 1}`,
          status: 'draft'
        });
      }

      setUserTeams(teams);
      setCurrentRoster(teams[0] || emptyRoster);

    } catch (error) {
      console.error('Error in loadUserTeams:', error);
      logError(error, 'useMyTeam.loadUserTeams');
      initializeTeams();
    } finally {
      setLoading(false);
    }
  }, [user, initializeTeams, getMaxTeamsAllowed, leagueId, currentRound.id]);

  // Load team history for all rounds
  const loadTeamHistory = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch all submitted teams for this user (all rounds)
      let historyQuery = supabase
        .from('myteam_rosters')
        .select(`
          *,
          myteam_player_predictions (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Handle league_id properly for history query
      if (leagueId) {
        historyQuery = historyQuery.eq('league_id', leagueId);
      } else {
        historyQuery = historyQuery.is('league_id', null);
      }

      const { data: historicalRosters, error: historyError } = await historyQuery;

      if (historyError) {
        console.error('Error loading team history:', historyError);
        logError(historyError, 'useMyTeam.loadTeamHistory');
        return;
      }

      console.log('Loaded team history:', historicalRosters);

      // Convert to our format
      const history = [];
      if (historicalRosters && historicalRosters.length > 0) {
        historicalRosters.forEach((roster) => {
          // Reconstruct predictions object
          const predictions = {};
          if (roster.myteam_player_predictions) {
            roster.myteam_player_predictions.forEach(pred => {
              if (!predictions[pred.player_id]) {
                predictions[pred.player_id] = {};
              }

              // Add each stat prediction
              if (pred.points_prediction) {
                predictions[pred.player_id].points = {
                  prediction: pred.points_prediction,
                  stake: pred.points_stake || 0
                };
              }
              if (pred.assists_prediction) {
                predictions[pred.player_id].assists = {
                  prediction: pred.assists_prediction,
                  stake: pred.assists_stake || 0
                };
              }
              if (pred.rebounds_prediction) {
                predictions[pred.player_id].rebounds = {
                  prediction: pred.rebounds_prediction,
                  stake: pred.rebounds_stake || 0
                };
              }
            });
          }

          history.push({
            id: roster.id,
            teamName: roster.team_name,
            roundId: roster.round_id,
            status: roster.status,
            submittedAt: roster.created_at,
            starters: {
              PG: roster.pg_starter,
              SG: roster.sg_starter,
              SF: roster.sf_starter,
              PF: roster.pf_starter,
              C: roster.c_starter
            },
            bench: {
              PG: roster.pg_bench,
              SG: roster.sg_bench,
              SF: roster.sf_bench,
              PF: roster.pf_bench,
              C: roster.c_bench
            },
            predictions,
            totalBudgetUsed: roster.total_budget_used || 0
          });
        });
      }

      setTeamHistory(history);
    } catch (error) {
      console.error('Error in loadTeamHistory:', error);
      logError(error, 'useMyTeam.loadTeamHistory');
    }
  }, [user, leagueId]);

  // Auto-save draft team to database
  const saveDraftTeam = useCallback(async (roster) => {
    if (!user || !roster || roster.status === 'submitted') return;

    try {
      console.log('=== AUTO-SAVING DRAFT TEAM ===');
      console.log('Roster data:', roster);
      console.log('User ID:', user.id);
      console.log('League ID:', leagueId);
      console.log('Round ID:', currentRound.id);

      let currentRosterId = roster.rosterId;

      // Check if this team already exists in database
      if (currentRosterId) {
        console.log('Updating existing draft team with ID:', currentRosterId);
        // Update existing draft
        const { error: updateError } = await supabase
          .from('myteam_rosters')
          .update({
            team_name: roster.teamName || `Team ${selectedTeamIndex + 1}`,
            pg_starter: roster.starters.PG,
            sg_starter: roster.starters.SG,
            sf_starter: roster.starters.SF,
            pf_starter: roster.starters.PF,
            c_starter: roster.starters.C,
            pg_bench: roster.bench.PG,
            sg_bench: roster.bench.SG,
            sf_bench: roster.bench.SF,
            pf_bench: roster.bench.PF,
            c_bench: roster.bench.C,
            total_budget_used: roster.totalBudgetUsed || 0,
            status: 'draft',
            updated_at: new Date().toISOString()
          })
          .eq('id', currentRosterId);

        if (updateError) {
          console.error('Error updating draft team:', updateError);
          return;
        }

        // Delete existing predictions and re-insert
        await supabase
          .from('myteam_player_predictions')
          .delete()
          .eq('roster_id', currentRosterId);

        console.log('✅ Draft team updated successfully');
      } else {
        console.log('Creating new draft team...');
        // Create new draft team
        const { data: rosterData, error: insertError } = await supabase
          .from('myteam_rosters')
          .insert({
            user_id: user.id,
            league_id: leagueId,
            team_name: roster.teamName || `Team ${selectedTeamIndex + 1}`,
            round_id: currentRound.id,
            pg_starter: roster.starters.PG,
            sg_starter: roster.starters.SG,
            sf_starter: roster.starters.SF,
            pf_starter: roster.starters.PF,
            c_starter: roster.starters.C,
            pg_bench: roster.bench.PG,
            sg_bench: roster.bench.SG,
            sf_bench: roster.bench.SF,
            pf_bench: roster.bench.PF,
            c_bench: roster.bench.C,
            total_budget_used: roster.totalBudgetUsed || 0,
            status: 'draft'
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting draft team:', insertError);
          return;
        }

        currentRosterId = rosterData.id;

        // Update local state with database ID
        const updatedRoster = {
          ...roster,
          rosterId: currentRosterId
        };
        const updatedTeams = [...userTeams];
        updatedTeams[selectedTeamIndex] = updatedRoster;
        setUserTeams(updatedTeams);
        setCurrentRoster(updatedRoster);

        console.log('✅ New draft team created with ID:', currentRosterId);
      }

      // Save predictions if any exist
      if (currentRosterId && Object.keys(roster.predictions).length > 0) {
        const predictionInserts = [];
        Object.entries(roster.predictions).forEach(([playerId, playerPreds]) => {
          Object.entries(playerPreds).forEach(([statType, pred]) => {
            let positionType = 'starter';
            let position = null;

            // Find player position
            for (const [pos, id] of Object.entries(roster.starters)) {
              if (id === playerId) {
                position = pos;
                break;
              }
            }

            if (!position) {
              for (const [pos, id] of Object.entries(roster.bench)) {
                if (id === playerId) {
                  position = pos;
                  positionType = 'bench';
                  break;
                }
              }
            }

            if (position) {
              predictionInserts.push({
                roster_id: currentRosterId,
                player_id: playerId,
                round_id: currentRound.id,
                position_type: positionType,
                position: position,
                [`${statType}_prediction`]: pred.prediction,
                [`${statType}_stake`]: pred.stake
              });
            }
          });
        });

        if (predictionInserts.length > 0) {
          const { error: predictionsError } = await supabase
            .from('myteam_player_predictions')
            .insert(predictionInserts);

          if (predictionsError) {
            console.error('Error saving predictions:', predictionsError);
          } else {
            console.log('✅ Predictions saved:', predictionInserts.length);
          }
        }
      }

      console.log('✅ Draft team auto-saved successfully');
    } catch (error) {
      console.error('Error auto-saving draft team:', error);
    }
  }, [user, leagueId, currentRound.id, selectedTeamIndex, userTeams]);

  // Load data on mount
  useEffect(() => {
    loadPlayers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load user teams when user changes
  useEffect(() => {
    if (user) {
      loadUserTeams();
      loadTeamHistory();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Switch between user's teams
  const switchTeam = (teamIndex) => {
    if (teamIndex >= 0 && teamIndex < userTeams.length) {
      setSelectedTeamIndex(teamIndex);
      setCurrentRoster(userTeams[teamIndex]);
    }
  };

  // Add player to roster
  const addPlayerToRoster = (player, position, isStarter = true) => {
    const section = isStarter ? 'starters' : 'bench';

    // Check if position is already filled
    if (currentRoster[section][position]) {
      return {
        success: false,
        error: `${position} ${section} position is already filled`
      };
    }

    // Check if player is already in roster
    const isPlayerInRoster = Object.values(currentRoster.starters).includes(player.id) ||
                            Object.values(currentRoster.bench).includes(player.id);

    if (isPlayerInRoster) {
      return {
        success: false,
        error: 'Player is already in your roster'
      };
    }

    // Update roster
    const newRoster = {
      ...currentRoster,
      [section]: {
        ...currentRoster[section],
        [position]: player.id
      }
    };

    setCurrentRoster(newRoster);

    // Update teams array
    const newTeams = [...userTeams];
    newTeams[selectedTeamIndex] = newRoster;
    setUserTeams(newTeams);

    // Auto-save to database
    setTimeout(() => saveDraftTeam(newRoster), 500);

    return { success: true };
  };

  // Remove player from roster
  const removePlayerFromRoster = (position, isStarter = true) => {
    const section = isStarter ? 'starters' : 'bench';
    const playerId = currentRoster[section][position];

    if (!playerId) return { success: false, error: 'No player in this position' };

    // Remove player predictions when removing player
    const newPredictions = { ...currentRoster.predictions };
    delete newPredictions[playerId];

    const newRoster = {
      ...currentRoster,
      [section]: {
        ...currentRoster[section],
        [position]: null
      },
      predictions: newPredictions,
      totalBudgetUsed: calculateTotalBudgetUsed(newPredictions)
    };

    setCurrentRoster(newRoster);

    // Update teams array
    const newTeams = [...userTeams];
    newTeams[selectedTeamIndex] = newRoster;
    setUserTeams(newTeams);

    // Auto-save to database
    setTimeout(() => saveDraftTeam(newRoster), 500);

    return { success: true };
  };

  // Add prediction for a player
  const addPlayerPrediction = (playerId, statType, prediction, stakeAmount) => {
    const availableBudget = getAvailableBudget(false, 'myteam');
    const currentBudgetUsed = currentRoster.totalBudgetUsed;

    // Check if user can afford this stake
    if (currentBudgetUsed + stakeAmount > availableBudget) {
      return {
        success: false,
        error: `Insufficient budget. Available: ${(availableBudget - currentBudgetUsed).toFixed(1)}%`
      };
    }

    const newPredictions = {
      ...currentRoster.predictions,
      [playerId]: {
        ...currentRoster.predictions[playerId],
        [statType]: {
          prediction,
          stake: stakeAmount
        }
      }
    };

    const newTotalBudget = calculateTotalBudgetUsed(newPredictions);

    const newRoster = {
      ...currentRoster,
      predictions: newPredictions,
      totalBudgetUsed: newTotalBudget
    };

    setCurrentRoster(newRoster);

    // Update teams array
    const newTeams = [...userTeams];
    newTeams[selectedTeamIndex] = newRoster;
    setUserTeams(newTeams);

    // Auto-save to database
    setTimeout(() => saveDraftTeam(newRoster), 500);

    return { success: true };
  };

  // Remove prediction for a player
  const removePlayerPrediction = (playerId, statType) => {
    if (!currentRoster.predictions[playerId]?.[statType]) {
      return { success: false, error: 'No prediction found' };
    }

    const newPredictions = { ...currentRoster.predictions };
    delete newPredictions[playerId][statType];

    // If no predictions left for this player, remove player entry
    if (Object.keys(newPredictions[playerId]).length === 0) {
      delete newPredictions[playerId];
    }

    const newTotalBudget = calculateTotalBudgetUsed(newPredictions);

    const newRoster = {
      ...currentRoster,
      predictions: newPredictions,
      totalBudgetUsed: newTotalBudget
    };

    setCurrentRoster(newRoster);

    // Update teams array
    const newTeams = [...userTeams];
    newTeams[selectedTeamIndex] = newRoster;
    setUserTeams(newTeams);

    // Auto-save to database
    setTimeout(() => saveDraftTeam(newRoster), 500);

    return { success: true };
  };

  // Calculate total budget used
  const calculateTotalBudgetUsed = (predictions) => {
    let total = 0;
    Object.values(predictions).forEach(playerPreds => {
      Object.values(playerPreds).forEach(pred => {
        total += pred.stake || 0;
      });
    });
    return Math.round(total * 100) / 100;
  };

  // Validate roster (all positions filled)
  const validateRoster = () => {
    const errors = [];
    console.log('=== VALIDATING ROSTER ===');
    console.log('Current roster:', currentRoster);

    // Check if all starter positions are filled
    Object.entries(currentRoster.starters).forEach(([position, playerId]) => {
      if (!playerId) {
        errors.push(`Missing ${position} starter`);
        console.log(`❌ Missing ${position} starter`);
      } else {
        console.log(`✅ ${position} starter: ${playerId}`);
      }
    });

    // Check if all bench positions are filled
    Object.entries(currentRoster.bench).forEach(([position, playerId]) => {
      if (!playerId) {
        errors.push(`Missing ${position} bench player`);
        console.log(`❌ Missing ${position} bench player`);
      } else {
        console.log(`✅ ${position} bench: ${playerId}`);
      }
    });

    // Check if at least one prediction is made
    const predictionsCount = Object.keys(currentRoster.predictions).length;
    console.log('Predictions count:', predictionsCount);
    console.log('Predictions:', currentRoster.predictions);

    if (predictionsCount === 0) {
      errors.push('At least one player prediction is required');
      console.log('❌ No predictions made');
    } else {
      console.log(`✅ ${predictionsCount} player(s) have predictions`);
    }

    // Check budget validation (only if we have predictions)
    if (currentRoster.totalBudgetUsed > 0) {
      try {
        const budgetValidation = canPlaceTicket(currentRoster.totalBudgetUsed, false, 'myteam');
        console.log('Budget validation:', budgetValidation);
        if (!budgetValidation.canPlace) {
          errors.push(budgetValidation.reason);
          console.log('❌ Budget validation failed:', budgetValidation.reason);
        } else {
          console.log('✅ Budget validation passed');
        }
      } catch (budgetError) {
        console.error('❌ Budget validation error:', budgetError);
        errors.push('Budget validation failed');
      }
    }

    console.log('Validation errors:', errors);
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Calculate total stake and potential win for all predictions
  const calculateTeamPredictionValue = useCallback(() => {
    let totalStake = 0;
    let totalPotentialWin = 0;

    Object.entries(currentRoster.predictions).forEach(([playerId, playerPreds]) => {
      const playerOdds = getPlayerOddsLocal(playerId);

      Object.entries(playerPreds).forEach(([statType, pred]) => {
        const stake = pred.stake || 0;
        const odds = playerOdds[statType]?.odds || 1.5;
        const potentialWin = stake * odds;

        totalStake += stake;
        totalPotentialWin += potentialWin;
      });
    });

    return {
      totalStake: Math.round(totalStake * 100) / 100,
      totalPotentialWin: Math.round(totalPotentialWin * 100) / 100
    };
  }, [currentRoster.predictions, getPlayerOddsLocal]);

  // Submit team for current round
  const submitTeam = async () => {
    console.log('=== SUBMITTING TEAM ===');
    console.log('Current roster:', currentRoster);

    const validation = validateRoster();
    console.log('Validation result:', validation);

    if (!validation.isValid) {
      console.log('Validation failed:', validation.errors);
      return {
        success: false,
        errors: validation.errors
      };
    }

    try {
      // Save team to database
      console.log('✅ Team validation passed, submitting team:', currentRoster);

      // First, save the roster
      const { data: rosterData, error: rosterError } = await supabase
        .from('myteam_rosters')
        .insert({
          user_id: user.id,
          league_id: leagueId, // null for public league
          team_name: currentRoster.teamName || `Team ${selectedTeamIndex + 1}`,
          round_id: currentRound.id,
          // Starting lineup
          pg_starter: currentRoster.starters.PG,
          sg_starter: currentRoster.starters.SG,
          sf_starter: currentRoster.starters.SF,
          pf_starter: currentRoster.starters.PF,
          c_starter: currentRoster.starters.C,
          // Bench players
          pg_bench: currentRoster.bench.PG,
          sg_bench: currentRoster.bench.SG,
          sf_bench: currentRoster.bench.SF,
          pf_bench: currentRoster.bench.PF,
          c_bench: currentRoster.bench.C,
          // Metadata
          total_budget_used: currentRoster.totalBudgetUsed,
          status: 'submitted'
        })
        .select()
        .single();

      if (rosterError) {
        console.error('❌ Roster save error:', rosterError);
        throw rosterError;
      }

      console.log('✅ Roster saved:', rosterData);

      // Save all player predictions
      const predictionInserts = [];
      Object.entries(currentRoster.predictions).forEach(([playerId, playerPreds]) => {
        Object.entries(playerPreds).forEach(([statType, pred]) => {
          // Determine position type and position
          let positionType = 'starter';
          let position = null;

          // Check if player is in starters
          for (const [pos, id] of Object.entries(currentRoster.starters)) {
            if (id === playerId) {
              position = pos;
              break;
            }
          }

          // If not found in starters, check bench
          if (!position) {
            for (const [pos, id] of Object.entries(currentRoster.bench)) {
              if (id === playerId) {
                position = pos;
                positionType = 'bench';
                break;
              }
            }
          }

          if (position) {
            predictionInserts.push({
              roster_id: rosterData.id,
              player_id: playerId,
              round_id: currentRound.id,
              position_type: positionType,
              position: position,
              [`${statType}_prediction`]: pred.prediction,
              [`${statType}_stake`]: pred.stake
            });
          }
        });
      });

      if (predictionInserts.length > 0) {
        const { error: predictionsError } = await supabase
          .from('myteam_player_predictions')
          .insert(predictionInserts);

        if (predictionsError) {
          console.error('❌ Predictions save error:', predictionsError);
          throw predictionsError;
        }

        console.log('✅ Predictions saved:', predictionInserts.length, 'predictions');
      }

      // Calculate total prediction value and save to predictions table for profit tracking
      const predictionValue = calculateTeamPredictionValue();
      console.log('💰 Team prediction value:', predictionValue);

      if (predictionValue.totalStake > 0) {
        // Create a comprehensive team prediction entry for the MyTeam system
        const teamData = {
          starters: currentRoster.starters,
          bench: currentRoster.bench,
          predictions: currentRoster.predictions,
          totalBudgetUsed: currentRoster.totalBudgetUsed
        };

        const { error: teamPredictionError } = await supabase
          .from('predictions')
          .insert({
            user_id: user.id,
            league_type: 'MyTeam',
            total_odds: predictionValue.totalPotentialWin / predictionValue.totalStake, // Average odds
            stake_amount: predictionValue.totalStake,
            potential_return: predictionValue.totalPotentialWin,
            status: 'pending',
            match_data: {
              round_id: currentRound.id,
              roster_id: rosterData.id,
              team_data: teamData,
              prediction_count: predictionInserts.length
            },
            description: `MyTeam Round ${currentRound.round_number} - ${predictionInserts.length} player predictions`
          });

        if (teamPredictionError) {
          console.error('❌ Team prediction save error:', teamPredictionError);
          logError(teamPredictionError, 'useMyTeam.submitTeam.teamPrediction');
          // Don't throw here - team was saved successfully, this is just for profit tracking
        } else {
          console.log('✅ Team prediction saved for profit tracking');
        }
      }

      // Update local state to mark team as submitted
      const submittedRoster = {
        ...currentRoster,
        status: 'submitted',
        rosterId: rosterData.id,
        submittedAt: new Date().toISOString()
      };

      setCurrentRoster(submittedRoster);

      // Update teams array
      const newTeams = [...userTeams];
      newTeams[selectedTeamIndex] = submittedRoster;
      setUserTeams(newTeams);

      // Refresh team history after successful submission
      await loadTeamHistory();

      console.log('✅ Team submitted successfully!');
      return { success: true, rosterId: rosterData.id };
    } catch (error) {
      console.error('❌ Submit team error:', error);
      logError(error, 'useMyTeam.submitTeam');
      return {
        success: false,
        errors: ['Failed to submit team. Please try again.']
      };
    }
  };

  // Helper: Get player by ID from local state
  const getPlayerByIdLocal = useCallback((playerId) => {
    return availablePlayers.find(p => p.id === playerId);
  }, [availablePlayers]);

  // Helper: Get player predictions (odds) from local state
  const getPlayerPredictionsLocal = useCallback((playerId) => {
    return playerPredictions[playerId] || {};
  }, [playerPredictions]);

  // Helper: Get player odds (alias for predictions)
  const getPlayerOddsLocal = useCallback((playerId) => {
    return playerPredictions[playerId] || {};
  }, [playerPredictions]);

  // Get roster summary
  const getRosterSummary = useCallback(() => {
    const allPlayers = [...Object.values(currentRoster.starters), ...Object.values(currentRoster.bench)]
      .filter(Boolean)
      .map(playerId => getPlayerByIdLocal(playerId))
      .filter(Boolean);

    const predictionsCount = Object.keys(currentRoster.predictions).length;
    const totalPredictions = Object.values(currentRoster.predictions).reduce((total, playerPreds) =>
      total + Object.keys(playerPreds).length, 0
    );

    return {
      playersSelected: allPlayers.length,
      totalPlayers: 10,
      predictionsCount,
      totalPredictions,
      budgetUsed: currentRoster.totalBudgetUsed,
      availableBudget: getAvailableBudget(false, 'myteam'),
      isComplete: allPlayers.length === 10 && predictionsCount > 0
    };
  }, [currentRoster, getPlayerByIdLocal, getAvailableBudget]);

  // Helper functions for round management
  const isRoundActive = (round) => {
    const now = new Date();
    const deadline = new Date(round.submission_deadline);
    return round.status === 'active' && now < deadline;
  };

  const getRoundStatus = (round) => {
    const now = new Date();
    const deadline = new Date(round.submission_deadline);

    if (round.status === 'completed') return 'Completed';
    if (round.status === 'active' && now < deadline) return 'Active - Open for Submissions';
    if (round.status === 'active' && now >= deadline) return 'Active - Submission Closed';
    if (round.status === 'upcoming') return 'Upcoming';
    return round.status;
  };

  const getTimeUntilDeadline = (round) => {
    const now = new Date();
    const deadline = new Date(round.submission_deadline);
    const diff = deadline - now;

    if (diff <= 0) return 'Deadline passed';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  return {
    // Data
    currentRoster,
    availablePlayers,
    playerPredictions,
    currentRound,
    availableRounds,
    userTeams,
    selectedTeamIndex,
    teamHistory,

    // State
    loading,

    // Functions
    addPlayerToRoster,
    removePlayerFromRoster,
    addPlayerPrediction,
    removePlayerPrediction,
    switchTeam,
    validateRoster,
    submitTeam,
    getRosterSummary,
    loadTeamHistory,
    saveDraftTeam,

    // Round Management
    isRoundActive,
    getRoundStatus,
    getTimeUntilDeadline,

    // Helpers
    getPlayersByPosition,
    getPlayerById: getPlayerByIdLocal,
    getPlayerPredictions: getPlayerPredictionsLocal,
    getPlayerOdds: getPlayerOddsLocal,
    getMaxTeamsAllowed: getMaxTeamsAllowed()
  };
};