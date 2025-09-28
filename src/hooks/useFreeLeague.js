import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBudget } from './useBudget';
import {
  LEAGUE_RANKS,
  mockLeagueStats,
  mockMonthlyWinners,
  mockFreeLeagueLeaderboard,
  getRankConfig,
  getNextRank,
  getPreviousRank,
  getCurrentMonthName,
  getCurrentMonthKey
} from '../data/freeLeagueData';

export const useFreeLeague = () => {
  const { profile } = useAuth();
  const { betLeagueProfit } = useBudget();
  const [loading, setLoading] = useState(true);

  // User's league data (would come from backend)
  const [userLeagueData, setUserLeagueData] = useState({
    currentRank: LEAGUE_RANKS.BRONZE,
    monthlyProfit: 0,
    position: 1,
    bets: 0,
    winRate: 0
  });

  useEffect(() => {
    // Simulate loading delay and sync with freeProfit
    const loadUserLeagueData = async () => {
      setLoading(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Use actual betLeagueProfit from useBudget
      setUserLeagueData(prev => ({
        ...prev,
        monthlyProfit: betLeagueProfit,
        // Mock other data for now
        bets: Math.floor(Math.random() * 50) + 10,
        winRate: Math.random() * 30 + 45
      }));

      setLoading(false);
    };

    loadUserLeagueData();
  }, [betLeagueProfit]);

  // Calculate user's position in current rank
  const getUserPositionInRank = useMemo(() => {
    if (!profile) return null;

    // Filter leaderboard by user's current rank
    const sameRankPlayers = mockFreeLeagueLeaderboard.filter(
      player => player.rank === userLeagueData.currentRank
    );

    // Sort by profit descending
    const sortedPlayers = [...sameRankPlayers].sort((a, b) => b.profit - a.profit);

    // Add current user to the list for comparison
    const userInList = [...sortedPlayers, {
      id: 999,
      username: profile.username,
      profit: userLeagueData.monthlyProfit,
      rank: userLeagueData.currentRank,
      bets: userLeagueData.bets,
      winRate: userLeagueData.winRate
    }].sort((a, b) => b.profit - a.profit);

    // Find user position
    const userIndex = userInList.findIndex(player => player.id === 999);
    return userIndex + 1;
  }, [userLeagueData, profile]);

  // Get user's rank config
  const userRankConfig = useMemo(() => {
    return getRankConfig(userLeagueData.currentRank);
  }, [userLeagueData.currentRank]);

  // Get promotion/demotion info
  const rankProgress = useMemo(() => {
    const nextRank = getNextRank(userLeagueData.currentRank);
    const prevRank = getPreviousRank(userLeagueData.currentRank);

    return {
      nextRank: nextRank ? getRankConfig(nextRank) : null,
      prevRank: prevRank ? getRankConfig(prevRank) : null,
      canPromote: nextRank !== null,
      canDemote: prevRank !== null,
      promotionPosition: 3, // Top 3 get promoted
      demotionPosition: getUsersInRank(userLeagueData.currentRank) - 2 // Bottom 3 get demoted
    };
  }, [userLeagueData.currentRank]);

  // Helper function to get number of users in specific rank
  function getUsersInRank(rank) {
    return mockLeagueStats[rank] || 0;
  }

  // Get league statistics
  const leagueStats = useMemo(() => {
    return {
      ...mockLeagueStats,
      userRank: userLeagueData.currentRank,
      userPosition: getUserPositionInRank
    };
  }, [userLeagueData.currentRank, getUserPositionInRank]);

  // Get monthly winners
  const monthlyWinners = useMemo(() => {
    return Object.entries(mockMonthlyWinners)
      .sort(([a], [b]) => b.localeCompare(a)) // Sort by date descending
      .slice(0, 12) // Last 12 months
      .map(([monthKey, winner]) => {
        const [year, month] = monthKey.split('-');
        const monthNames = [
          'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
          'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
        ];

        return {
          monthKey,
          monthName: monthNames[parseInt(month) - 1],
          year,
          winner
        };
      });
  }, []);

  // Get current month leaderboard
  const currentMonthLeaderboard = useMemo(() => {
    // Add current user to leaderboard if not already present
    const userInLeaderboard = mockFreeLeagueLeaderboard.some(
      player => player.username === profile?.username
    );

    let leaderboard = [...mockFreeLeagueLeaderboard];

    if (!userInLeaderboard && profile) {
      leaderboard.push({
        id: 999,
        username: profile.username,
        profit: userLeagueData.monthlyProfit,
        rank: userLeagueData.currentRank,
        bets: userLeagueData.bets,
        winRate: userLeagueData.winRate,
        avatar: "👤",
        isCurrentUser: true
      });
    }

    // Sort by profit descending
    return leaderboard.sort((a, b) => b.profit - a.profit);
  }, [userLeagueData, profile]);

  // Get user's overall position in league
  const getUserOverallPosition = useMemo(() => {
    const userIndex = currentMonthLeaderboard.findIndex(
      player => player.username === profile?.username || player.isCurrentUser
    );
    return userIndex === -1 ? currentMonthLeaderboard.length + 1 : userIndex + 1;
  }, [currentMonthLeaderboard, profile]);

  // Get promotion/demotion status messages
  const getStatusMessage = useMemo(() => {
    const position = getUserPositionInRank;
    const totalInRank = getUsersInRank(userLeagueData.currentRank);

    if (position <= 3 && rankProgress.canPromote) {
      return {
        type: 'promotion',
        message: `You are in position #${position}! Top 3 get promoted to ${rankProgress.nextRank?.name}!`,
        color: 'success'
      };
    } else if (position > totalInRank - 3 && rankProgress.canDemote) {
      return {
        type: 'demotion',
        message: `Warning! You are in position #${position}. Bottom 3 get demoted to ${rankProgress.prevRank?.name}.`,
        color: 'danger'
      };
    } else {
      return {
        type: 'stable',
        message: `You are in position #${position} in the ${userRankConfig.name} league.`,
        color: 'info'
      };
    }
  }, [getUserPositionInRank, userLeagueData.currentRank, rankProgress, userRankConfig]);

  return {
    // User data
    userLeagueData,
    userRankConfig,
    userPositionInRank: getUserPositionInRank,
    userOverallPosition: getUserOverallPosition,

    // League data
    leagueStats,
    currentMonthLeaderboard,
    monthlyWinners,

    // Progress info
    rankProgress,
    statusMessage: getStatusMessage,

    // Utils
    currentMonth: getCurrentMonthName(),
    currentMonthKey: getCurrentMonthKey(),
    loading,

    // Helper functions
    getRankConfig,
    getUsersInRank
  };
};