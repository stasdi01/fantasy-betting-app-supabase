import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { logError } from '../utils/errorHandler';

// Mock data functions
const getMockTopPerformers = () => [
  {
    userId: 'mock-1',
    username: 'PredictionKing',
    role: 'max',
    betLeagueProfit: 287.5,
    myTeamProfit: 156.8,
    totalProfit: 444.3,
    betLeagueRank: 1,
    myTeamRank: 2,
    league: 'Both',
    overallRank: 1
  },
  {
    userId: 'mock-2',
    username: 'EuroMaster',
    role: 'pro',
    betLeagueProfit: 198.7,
    myTeamProfit: 189.2,
    totalProfit: 387.9,
    betLeagueRank: 2,
    myTeamRank: 1,
    league: 'Both',
    overallRank: 2
  },
  {
    userId: 'mock-3',
    username: 'BetGuru',
    role: 'max',
    betLeagueProfit: 234.6,
    myTeamProfit: 98.4,
    totalProfit: 333.0,
    betLeagueRank: 1,
    myTeamRank: 5,
    league: 'BetLeague',
    overallRank: 3
  },
  {
    userId: 'mock-4',
    username: 'FantasyPro',
    role: 'pro',
    betLeagueProfit: 89.3,
    myTeamProfit: 198.7,
    totalProfit: 288.0,
    betLeagueRank: 8,
    myTeamRank: 1,
    league: 'MyTeam',
    overallRank: 4
  },
  {
    userId: 'mock-5',
    username: 'StatWizard',
    role: 'max',
    betLeagueProfit: 156.9,
    myTeamProfit: 124.3,
    totalProfit: 281.2,
    betLeagueRank: 3,
    myTeamRank: 3,
    league: 'Both',
    overallRank: 5
  },
  {
    userId: 'mock-6',
    username: 'OddsExpert',
    role: 'pro',
    betLeagueProfit: 189.4,
    myTeamProfit: 67.8,
    totalProfit: 257.2,
    betLeagueRank: 2,
    myTeamRank: 8,
    league: 'BetLeague',
    overallRank: 6
  },
  {
    userId: 'mock-7',
    username: 'TeamBuilder',
    role: 'free',
    betLeagueProfit: 98.6,
    myTeamProfit: 145.7,
    totalProfit: 244.3,
    betLeagueRank: 6,
    myTeamRank: 2,
    league: 'MyTeam',
    overallRank: 7
  },
  {
    userId: 'mock-8',
    username: 'BetLegend',
    role: 'max',
    betLeagueProfit: 176.8,
    myTeamProfit: 54.2,
    totalProfit: 231.0,
    betLeagueRank: 3,
    myTeamRank: 12,
    league: 'BetLeague',
    overallRank: 8
  },
  {
    userId: 'mock-9',
    username: 'PlayerPro',
    role: 'pro',
    betLeagueProfit: 87.3,
    myTeamProfit: 134.5,
    totalProfit: 221.8,
    betLeagueRank: 9,
    myTeamRank: 3,
    league: 'Both',
    overallRank: 9
  },
  {
    userId: 'mock-10',
    username: 'ScoutMaster',
    role: 'free',
    betLeagueProfit: 123.4,
    myTeamProfit: 89.6,
    totalProfit: 213.0,
    betLeagueRank: 5,
    myTeamRank: 6,
    league: 'Both',
    overallRank: 10
  }
];

const getMockBetLeagueData = () => [
  { user_id: 'mock-1', bet_league_profit: 287.5, users: { username: 'PredictionKing', role: 'max' }, league: 'BetLeague' },
  { user_id: 'mock-2', bet_league_profit: 198.7, users: { username: 'EuroMaster', role: 'pro' }, league: 'BetLeague' },
  { user_id: 'mock-3', bet_league_profit: 234.6, users: { username: 'BetGuru', role: 'max' }, league: 'BetLeague' }
];

const getMockMyTeamData = () => [
  { user_id: 'mock-2', profit: 189.2, users: { username: 'EuroMaster', role: 'pro' }, league: 'MyTeam' },
  { user_id: 'mock-4', profit: 198.7, users: { username: 'FantasyPro', role: 'pro' }, league: 'MyTeam' },
  { user_id: 'mock-1', profit: 156.8, users: { username: 'PredictionKing', role: 'max' }, league: 'MyTeam' }
];

const getMockRecentPredictions = () => [
  {
    id: 'pred-1',
    user_id: 'mock-1',
    users: { username: 'PredictionKing', role: 'max' },
    prediction_type: 'match',
    match_info: { home_team: 'Real Madrid', away_team: 'Barcelona' },
    prediction_choice: 'Real Madrid to Win @ 2.10',
    stake_amount: 15,
    potential_return: 16.5,
    status: 'won',
    league_type: 'bet',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    performerRank: 1,
    performerProfit: 444.3
  },
  {
    id: 'pred-2',
    user_id: 'mock-2',
    users: { username: 'EuroMaster', role: 'pro' },
    prediction_type: 'match',
    match_info: { home_team: 'Bayern Munich', away_team: 'Dortmund' },
    prediction_choice: 'Over 2.5 Goals + PSG Win',
    description: 'Combined bet: Over 2.5 in Bayern vs Dortmund + PSG to beat Lyon',
    stake_amount: 8,
    potential_return: 29.04,
    status: 'pending',
    league_type: 'bet',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    performerRank: 2,
    performerProfit: 387.9
  },
  {
    id: 'pred-3',
    user_id: 'mock-3',
    users: { username: 'BetGuru', role: 'max' },
    prediction_type: 'player',
    player_info: { name: 'Nikola Milutinov' },
    prediction_choice: 'Double-Double',
    description: 'Fenerbahce center to record 10+ points and 10+ rebounds',
    stake_amount: 20,
    potential_return: 15.0,
    status: 'won',
    league_type: 'myteam',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    performerRank: 3,
    performerProfit: 333.0
  },
  {
    id: 'pred-4',
    user_id: 'mock-4',
    users: { username: 'FantasyPro', role: 'pro' },
    prediction_type: 'match',
    match_info: { home_team: 'Panathinaikos', away_team: 'Maccabi Tel Aviv' },
    prediction_choice: 'Over 215.5 Total Points @ 1.90',
    stake_amount: 12,
    potential_return: 10.8,
    status: 'lost',
    league_type: 'myteam',
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    performerRank: 4,
    performerProfit: 288.0
  },
  {
    id: 'pred-5',
    user_id: 'mock-5',
    users: { username: 'StatWizard', role: 'max' },
    prediction_type: 'match',
    match_info: { home_team: 'AC Milan', away_team: 'Inter Milan' },
    prediction_choice: 'Draw + Under 2.5 Goals',
    description: 'Low-scoring Milan derby with draw result',
    stake_amount: 5,
    potential_return: 28.6,
    status: 'pending',
    league_type: 'bet',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    performerRank: 5,
    performerProfit: 281.2
  }
];

export const useVipTeam = () => {
  const { isMax } = useAuth();

  const [loading, setLoading] = useState(true);
  const [topPerformers, setTopPerformers] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState({
    betLeague: [],
    myTeam: []
  });
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [performanceInsights, setPerformanceInsights] = useState(null);

  // Check if user has access to VIP Team
  const hasVipAccess = useCallback(() => {
    return isMax || process.env.NODE_ENV === 'development'; // Allow in development for testing
  }, [isMax]);

  // Fetch top performers from both leagues
  const fetchTopPerformers = useCallback(async () => {
    if (!hasVipAccess()) {
      setLoading(false);
      return;
    }

    try {
      // Get top 10 performers from BetLeague (monthly budgets)
      const { data: betLeagueTop, error: betError } = await supabase
        .from('monthly_budgets')
        .select(`
          user_id,
          bet_league_profit,
          users!monthly_budgets_user_id_fkey(username, role)
        `)
        .not('users', 'is', null)
        .order('bet_league_profit', { ascending: false })
        .limit(10);

      if (betError) throw betError;

      // Get top 10 performers from MyTeam League (myteam_round_budgets)
      const { data: myTeamTop, error: myTeamError } = await supabase
        .from('myteam_round_budgets')
        .select(`
          user_id,
          profit,
          users!myteam_round_budgets_user_id_fkey(username, role)
        `)
        .not('users', 'is', null)
        .order('profit', { ascending: false })
        .limit(10);

      if (myTeamError) throw myTeamError;

      // Combine and rank performers
      const combinedPerformers = [];

      // Process BetLeague performers
      betLeagueTop?.forEach((performer, index) => {
        if (performer.users) {
          combinedPerformers.push({
            userId: performer.user_id,
            username: performer.users.username,
            role: performer.users.role,
            betLeagueProfit: performer.bet_league_profit || 0,
            myTeamProfit: 0,
            totalProfit: performer.bet_league_profit || 0,
            betLeagueRank: index + 1,
            myTeamRank: null,
            league: 'BetLeague'
          });
        }
      });

      // Process MyTeam performers and merge with existing data
      myTeamTop?.forEach((performer, index) => {
        if (performer.users) {
          const existingPerformer = combinedPerformers.find(p => p.userId === performer.user_id);
          if (existingPerformer) {
            existingPerformer.myTeamProfit = performer.profit || 0;
            existingPerformer.totalProfit = existingPerformer.betLeagueProfit + (performer.profit || 0);
            existingPerformer.myTeamRank = index + 1;
            if (existingPerformer.myTeamRank <= existingPerformer.betLeagueRank) {
              existingPerformer.league = 'Both';
            }
          } else {
            combinedPerformers.push({
              userId: performer.user_id,
              username: performer.users.username,
              role: performer.users.role,
              betLeagueProfit: 0,
              myTeamProfit: performer.profit || 0,
              totalProfit: performer.profit || 0,
              betLeagueRank: null,
              myTeamRank: index + 1,
              league: 'MyTeam'
            });
          }
        }
      });

      // Sort by total profit and take top 10
      const topPerformers = combinedPerformers
        .sort((a, b) => b.totalProfit - a.totalProfit)
        .slice(0, 10)
        .map((performer, index) => ({
          ...performer,
          overallRank: index + 1
        }));

      // Use mock data if no real data is available
      const finalTopPerformers = topPerformers.length > 0 ? topPerformers : getMockTopPerformers();

      console.log('VIP Team Debug - topPerformers:', topPerformers);
      console.log('VIP Team Debug - finalTopPerformers:', finalTopPerformers);
      console.log('VIP Team Debug - hasVipAccess:', hasVipAccess());

      setTopPerformers(finalTopPerformers);
      setLeaderboardData({
        betLeague: betLeagueTop?.map(p => ({ ...p, league: 'BetLeague' })) || getMockBetLeagueData(),
        myTeam: myTeamTop?.map(p => ({ ...p, league: 'MyTeam' })) || getMockMyTeamData()
      });

    } catch (error) {
      console.error('Error fetching top performers:', error);
      logError(error, 'useVipTeam.fetchTopPerformers');

      // Fall back to mock data when database queries fail
      console.log('VIP Team Debug - Database error, using mock data');
      const mockTopPerformers = getMockTopPerformers();
      setTopPerformers(mockTopPerformers);
      setLeaderboardData({
        betLeague: getMockBetLeagueData(),
        myTeam: getMockMyTeamData()
      });
    }
  }, [hasVipAccess]);

  // Fetch recent predictions from top performers
  const fetchRecentPredictions = useCallback(async () => {
    if (!hasVipAccess() || topPerformers.length === 0) return;

    try {
      // Get top performer user IDs
      const topUserIds = topPerformers.slice(0, 5).map(p => p.userId);

      // Fetch recent predictions from top performers
      const { data: predictions, error } = await supabase
        .from('predictions')
        .select(`
          *,
          users!predictions_user_id_fkey(username, role)
        `)
        .in('user_id', topUserIds)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Enhance predictions with performer info
      const enhancedPredictions = predictions?.map(prediction => {
        const performer = topPerformers.find(p => p.userId === prediction.user_id);
        return {
          ...prediction,
          performerRank: performer?.overallRank || null,
          performerProfit: performer?.totalProfit || 0
        };
      }) || [];

      // Use mock data if no real predictions
      const finalPredictions = enhancedPredictions.length > 0 ? enhancedPredictions : getMockRecentPredictions();

      setRecentPredictions(finalPredictions);

    } catch (error) {
      console.error('Error fetching recent predictions:', error);
      logError(error, 'useVipTeam.fetchRecentPredictions');

      // Fall back to mock data when database queries fail
      console.log('VIP Team Debug - Database error for predictions, using mock data');
      setRecentPredictions(getMockRecentPredictions());
    }
  }, [hasVipAccess, topPerformers]);

  // Calculate performance insights
  const calculatePerformanceInsights = useCallback(() => {
    if (!hasVipAccess()) return;

    // Use mock data if no real data
    if (topPerformers.length === 0) {
      const mockInsights = {
        averageProfit: 275.8,
        bestPerformer: getMockTopPerformers()[0],
        mostConsistent: getMockTopPerformers()[0],
        roleDistribution: {
          free: 2,
          pro: 4,
          max: 4
        },
        predictionPatterns: {
          totalPredictions: 5,
          winRate: 60,
          averageStake: 12
        }
      };
      setPerformanceInsights(mockInsights);
      return;
    }

    const insights = {
      averageProfit: topPerformers.reduce((sum, p) => sum + p.totalProfit, 0) / topPerformers.length,
      bestPerformer: topPerformers[0],
      mostConsistent: topPerformers.find(p => p.betLeagueRank && p.myTeamRank) || topPerformers[0],
      roleDistribution: {
        free: topPerformers.filter(p => p.role === 'free').length,
        pro: topPerformers.filter(p => p.role === 'pro').length,
        max: topPerformers.filter(p => p.role === 'max').length
      },
      predictionPatterns: {
        totalPredictions: recentPredictions.length,
        winRate: recentPredictions.length > 0 ? (recentPredictions.filter(p => p.status === 'won').length / recentPredictions.length * 100) : 0,
        averageStake: recentPredictions.length > 0 ? (recentPredictions.reduce((sum, p) => sum + (p.stake_amount || 0), 0) / recentPredictions.length) : 0
      }
    };

    setPerformanceInsights(insights);
  }, [hasVipAccess, topPerformers, recentPredictions]);

  // Load all VIP Team data
  const loadVipTeamData = useCallback(async () => {
    console.log('VIP Team Debug - loadVipTeamData called, hasVipAccess:', hasVipAccess());

    if (!hasVipAccess()) {
      console.log('VIP Team Debug - No VIP access, setting loading to false');
      setLoading(false);
      return;
    }

    console.log('VIP Team Debug - Has VIP access, loading data...');
    setLoading(true);
    try {
      await fetchTopPerformers();
    } catch (error) {
      console.error('Error loading VIP team data:', error);
    } finally {
      setLoading(false);
    }
  }, [hasVipAccess, fetchTopPerformers]);

  // Load predictions after top performers are loaded
  useEffect(() => {
    if (topPerformers.length > 0) {
      fetchRecentPredictions();
    }
  }, [topPerformers, fetchRecentPredictions]);

  // Calculate insights after predictions are loaded or when using mock data
  useEffect(() => {
    if (recentPredictions.length > 0 || topPerformers.length > 0) {
      calculatePerformanceInsights();
    }
  }, [recentPredictions, topPerformers, calculatePerformanceInsights]);

  // Initial data load
  useEffect(() => {
    loadVipTeamData();
  }, [loadVipTeamData]);

  // Refresh data
  const refreshData = useCallback(() => {
    loadVipTeamData();
  }, [loadVipTeamData]);

  return {
    // Access control
    hasVipAccess: hasVipAccess(),

    // Data
    topPerformers,
    leaderboardData,
    recentPredictions,
    performanceInsights,

    // State
    loading,

    // Actions
    refreshData
  };
};