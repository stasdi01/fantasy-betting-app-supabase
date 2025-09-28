import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage, logError } from '../utils/errorHandler';

export const useVipTeam = () => {
  const { profile, isMax } = useAuth();

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
    return isMax;
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

      setTopPerformers(topPerformers);
      setLeaderboardData({
        betLeague: betLeagueTop?.map(p => ({ ...p, league: 'BetLeague' })) || [],
        myTeam: myTeamTop?.map(p => ({ ...p, league: 'MyTeam' })) || []
      });

    } catch (error) {
      console.error('Error fetching top performers:', error);
      logError(error, 'useVipTeam.fetchTopPerformers');
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

      setRecentPredictions(enhancedPredictions);

    } catch (error) {
      console.error('Error fetching recent predictions:', error);
      logError(error, 'useVipTeam.fetchRecentPredictions');
    }
  }, [hasVipAccess, topPerformers]);

  // Calculate performance insights
  const calculatePerformanceInsights = useCallback(() => {
    if (!hasVipAccess() || topPerformers.length === 0) return;

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
        winRate: recentPredictions.filter(p => p.status === 'won').length / recentPredictions.length * 100,
        averageStake: recentPredictions.reduce((sum, p) => sum + (p.stake_amount || 0), 0) / recentPredictions.length
      }
    };

    setPerformanceInsights(insights);
  }, [hasVipAccess, topPerformers, recentPredictions]);

  // Load all VIP Team data
  const loadVipTeamData = useCallback(async () => {
    if (!hasVipAccess()) {
      setLoading(false);
      return;
    }

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

  // Calculate insights after predictions are loaded
  useEffect(() => {
    if (recentPredictions.length > 0) {
      calculatePerformanceInsights();
    }
  }, [recentPredictions, calculatePerformanceInsights]);

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