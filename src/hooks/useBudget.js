import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { logError } from '../utils/errorHandler';

export const useBudget = () => {
  const { user, profile } = useAuth();
  const [budgetData, setBudgetData] = useState({
    betLeagueProfit: 0,
    myTeamLeagueProfit: 0,
    customLeagueBudgets: {}, // Custom league budgets
    loading: true
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const getCurrentMonthKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  const fetchBudgetData = useCallback(async () => {
    if (!user) {
      setBudgetData({ betLeagueProfit: 0, myTeamLeagueProfit: 0, customLeagueBudgets: {}, loading: false });
      return;
    }

    try {
      const monthKey = getCurrentMonthKey();

      // Fetch league budgets
      const { data, error } = await supabase
        .from('monthly_budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_year', monthKey)
        .single();

      // Fetch custom league budgets
      const { data: customBudgets, error: customError } = await supabase
        .from('custom_league_budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_year', monthKey);

      if (error && error.code !== 'PGRST116') {
        logError(error, 'useBudget.fetchBudgetData');
      }

      if (customError) {
        logError(customError, 'useBudget.fetchCustomLeagueBudgets');
      }

      // Process custom league budgets into object format
      const customLeagueBudgets = {};
      if (customBudgets && customBudgets.length > 0) {
        customBudgets.forEach(budget => {
          customLeagueBudgets[budget.league_id] = {
            budget: parseFloat(budget.budget) || 100,
            profit: parseFloat(budget.profit) || 0,
            bets: budget.bets || 0,
            wins: budget.wins || 0,
            winRate: parseFloat(budget.win_rate) || 0
          };
        });
      }

      console.log('Fetched custom league budgets:', customLeagueBudgets);

      if (data) {
        setBudgetData({
          betLeagueProfit: parseFloat(data.bet_league_profit) || 0,
          myTeamLeagueProfit: parseFloat(data.myteam_league_profit) || 0,
          customLeagueBudgets,
          loading: false
        });
      } else {
        // Create new month budget entry
        const { error: insertError } = await supabase
          .from('monthly_budgets')
          .insert([
            {
              user_id: user.id,
              month_year: monthKey,
              bet_league_profit: 0,
              myteam_league_profit: 0
            }
          ])
          .select()
          .single();

        if (insertError) {
          logError(insertError, 'useBudget.fetchBudgetData.createBudget');
        }

        setBudgetData({
          betLeagueProfit: 0,
          myTeamLeagueProfit: 0,
          customLeagueBudgets,
          loading: false
        });
      }
    } catch (error) {
      logError(error, 'useBudget.fetchBudgetData');
      setBudgetData({ betLeagueProfit: 0, myTeamLeagueProfit: 0, customLeagueBudgets: {}, loading: false });
    }
  }, [user]);

  // Custom league budgets will be loaded from database when needed

  useEffect(() => {
    fetchBudgetData();
    // TODO: Initialize custom league budgets when Your Leagues system is implemented
  }, [user, refreshKey, fetchBudgetData]);

  useEffect(() => {
    const handleProfitUpdate = () => {
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('profit-updated', handleProfitUpdate);
    return () => window.removeEventListener('profit-updated', handleProfitUpdate);
  }, []);

  const getAvailableBudget = (leagueType = 'bet') => {
    if (!profile) {
      return 0;
    }

    const isPremium = profile.role === 'premium' &&
                     profile.premium_expires_at &&
                     new Date(profile.premium_expires_at) > new Date();

    if (leagueType === 'myteam') {
      // MyTeam League: always 100% per round
      return Math.max(0, 100 + budgetData.myTeamLeagueProfit);
    } else {
      // BetLeague: uses monthly budget
      const baseBudget = isPremium ? 150 : 100; // Premium users get 150% for BetLeague
      return Math.max(0, baseBudget + budgetData.betLeagueProfit);
    }
  };

  const canPlaceTicket = (stakeAmount, leagueType = 'bet') => {
    const availableBudget = getAvailableBudget(leagueType);

    if (leagueType === 'myteam') {
      // MyTeam League validation
      const myTeamLimit = 100 + budgetData.myTeamLeagueProfit;
      if (myTeamLimit <= -100) {
        return {
          canPlace: false,
          reason: "MyTeam League blocked. You've reached -100% profit limit."
        };
      }
    } else {
      // BetLeague validation
      const betLeagueLimit = (profile?.role === 'premium' ? 150 : 100) + budgetData.betLeagueProfit;
      if (betLeagueLimit <= -100) {
        return {
          canPlace: false,
          reason: "BetLeague blocked. You've reached -100% profit limit."
        };
      }
    }

    if (stakeAmount > availableBudget) {
      return {
        canPlace: false,
        reason: `Insufficient budget. Available: ${availableBudget.toFixed(1)}%, Required: ${stakeAmount}%`
      };
    }

    return { canPlace: true, reason: null };
  };

  const updateProfit = async (stakeAmount, potentialWin, isWin, leagueType = 'bet') => {
    if (!user) return;

    try {
      const monthKey = getCurrentMonthKey();

      // Calculate profit change
      let profitChange;
      if (isWin) {
        profitChange = Math.round((potentialWin - stakeAmount) * 100) / 100; // Net win
      } else {
        profitChange = Math.round(-stakeAmount * 100) / 100; // Loss
      }

      const currentProfit = leagueType === 'myteam' ? budgetData.myTeamLeagueProfit : budgetData.betLeagueProfit;
      const newProfit = Math.round((currentProfit + profitChange) * 100) / 100;

      // Update database using upsert with all required fields
      const updateData = {
        user_id: user.id,
        month_year: monthKey,
        bet_league_profit: leagueType === 'myteam' ? budgetData.betLeagueProfit : newProfit,
        myteam_league_profit: leagueType === 'myteam' ? newProfit : budgetData.myTeamLeagueProfit
      };

      const { error } = await supabase
        .from('monthly_budgets')
        .upsert(updateData, {
          onConflict: 'user_id,month_year'
        });

      if (error) {
        logError(error, 'useBudget.updateProfit');
        return;
      }

      // Update local state
      setBudgetData(prev => ({
        ...prev,
        [leagueType === 'myteam' ? 'myTeamLeagueProfit' : 'betLeagueProfit']: newProfit
      }));

      return newProfit;
    } catch (error) {
      logError(error, 'useBudget.updateProfit');
    }
  };

  const deductStake = async (stakeAmount, isPremiumBet = false) => {
    if (!user) return;

    try {
      const monthKey = getCurrentMonthKey();

      // Deduct only the stake amount
      const profitChange = Math.round(-stakeAmount * 100) / 100;
      const currentProfit = isPremiumBet ? budgetData.premiumProfit : budgetData.freeProfit;
      const newProfit = Math.round((currentProfit + profitChange) * 100) / 100;

      // Update database using upsert with all required fields
      const updateData = {
        user_id: user.id,
        month_year: monthKey,
        free_profit: isPremiumBet ? budgetData.freeProfit : newProfit,
        premium_profit: isPremiumBet ? newProfit : budgetData.premiumProfit
      };

      const { error } = await supabase
        .from('monthly_budgets')
        .upsert(updateData, {
          onConflict: 'user_id,month_year'
        });

      if (error) {
        logError(error, 'useBudget.deductStake');
        return;
      }

      // Update local state
      setBudgetData(prev => ({
        ...prev,
        [isPremiumBet ? 'premiumProfit' : 'freeProfit']: newProfit
      }));

      return newProfit;
    } catch (error) {
      logError(error, 'useBudget.deductStake');
    }
  };

  const resolvePendingBet = async (stakeAmount, potentialWin, isWin, isPremiumBet = false) => {
    if (!user) return;

    try {
      const monthKey = getCurrentMonthKey();
      const currentProfit = isPremiumBet ? budgetData.premiumProfit : budgetData.freeProfit;

      // Calculate the adjustment needed
      // Since stake was already deducted for pending bet, we need to adjust
      let profitAdjustment;
      if (isWin) {
        // Add back the full win amount (since stake was already deducted)
        profitAdjustment = Math.round(potentialWin * 100) / 100;
      } else {
        // For loss, stake was already deducted, so no additional change needed
        profitAdjustment = 0;
      }

      const newProfit = Math.round((currentProfit + profitAdjustment) * 100) / 100;

      // Update database using upsert with all required fields
      const updateData = {
        user_id: user.id,
        month_year: monthKey,
        free_profit: isPremiumBet ? budgetData.freeProfit : newProfit,
        premium_profit: isPremiumBet ? newProfit : budgetData.premiumProfit
      };

      const { error } = await supabase
        .from('monthly_budgets')
        .upsert(updateData, {
          onConflict: 'user_id,month_year'
        });

      if (error) {
        logError(error, 'useBudget.resolvePendingBet');
        return;
      }

      // Update local state
      setBudgetData(prev => ({
        ...prev,
        [isPremiumBet ? 'premiumProfit' : 'freeProfit']: newProfit
      }));

      return newProfit;
    } catch (error) {
      logError(error, 'useBudget.resolvePendingBet');
    }
  };

  const getCurrentProfit = (leagueType = 'bet') => {
    return leagueType === 'myteam' ? budgetData.myTeamLeagueProfit : budgetData.betLeagueProfit;
  };

  const refetch = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Custom League Budget Management
  const getVipPoolBudget = (leagueId) => {
    if (!budgetData.customLeagueBudgets || !leagueId) {
      return { budget: 100, profit: 0, bets: 0, wins: 0, winRate: 0 };
    }
    return budgetData.customLeagueBudgets[leagueId] || { budget: 100, profit: 0, bets: 0, wins: 0, winRate: 0 };
  };

  const updateVipPoolBudget = async (poolId, newBudgetData) => {
    if (!user) return;

    try {
      const monthKey = getCurrentMonthKey();

      // Update local state immediately
      setBudgetData(prev => ({
        ...prev,
        vipPoolBudgets: {
          ...prev.vipPoolBudgets,
          [poolId]: newBudgetData
        }
      }));

      console.log('Updating VIP pool budget in database:', { poolId, newBudgetData });

      // Save to database
      const { data, error } = await supabase
        .from('custom_league_budgets')
        .upsert({
          user_id: user.id,
          league_id: poolId,
          month_year: monthKey,
          budget: newBudgetData.budget || 100,
          profit: newBudgetData.profit || 0,
          bets: newBudgetData.bets || 0,
          wins: newBudgetData.wins || 0,
          win_rate: newBudgetData.winRate || 0
        }, {
          onConflict: 'user_id,league_id,month_year'
        })
        .select();

      if (error) {
        console.error('Error updating VIP pool budget:', error);
        logError(error, 'useBudget.updateVipPoolBudget');
      } else {
        console.log('VIP pool budget updated successfully:', data);
      }

    } catch (error) {
      console.error('Error in updateVipPoolBudget:', error);
      logError(error, 'useBudget.updateVipPoolBudget');
    }
  };

  const getAvailablePoolBudget = (poolId) => {
    if (!poolId) return 0;
    const poolBudget = getVipPoolBudget(poolId);
    if (!poolBudget) return 0;
    return Math.max(0, (poolBudget.budget || 100) + (poolBudget.profit || 0));
  };

  const canPlacePoolBet = (poolId, stakeAmount) => {
    if (!poolId || !stakeAmount) {
      return { canPlace: false, reason: "Invalid pool or stake amount" };
    }

    const availableBudget = getAvailablePoolBudget(poolId);
    const poolBudget = getVipPoolBudget(poolId);
    if (!poolBudget) {
      return { canPlace: false, reason: "Pool budget not found" };
    }

    const currentProfit = poolBudget.profit || 0;
    const initialBudget = poolBudget.budget || 100;

    // Check if pool budget is blocked (reached -100% of initial budget)
    if (initialBudget + currentProfit <= -100) {
      return {
        canPlace: false,
        reason: "VIP Pool budget blocked. You've reached -100% profit limit for this pool."
      };
    }

    if (stakeAmount > availableBudget) {
      return {
        canPlace: false,
        reason: `Insufficient pool budget. Available: ${availableBudget.toFixed(1)}%, Required: ${stakeAmount}%`
      };
    }

    return { canPlace: true, reason: null };
  };

  const updateVipPoolProfit = async (poolId, stakeAmount, potentialWin, isWin) => {
    if (!poolId) return 0;
    const poolBudget = getVipPoolBudget(poolId);

    // Calculate profit change
    let profitChange;
    if (isWin) {
      profitChange = Math.round((potentialWin - stakeAmount) * 100) / 100; // Net win
    } else {
      profitChange = Math.round(-stakeAmount * 100) / 100; // Loss
    }

    const currentProfit = poolBudget.profit || 0;
    const currentBets = poolBudget.bets || 0;
    const currentWins = poolBudget.wins || 0;

    const newProfit = Math.round((currentProfit + profitChange) * 100) / 100;
    const newBets = currentBets + 1;
    const newWins = isWin ? currentWins + 1 : currentWins;
    const newWinRate = Math.round((newWins / newBets) * 1000) / 10; // One decimal place

    const newBudgetData = {
      ...poolBudget,
      profit: newProfit,
      bets: newBets,
      wins: newWins,
      winRate: newWinRate
    };

    await updateVipPoolBudget(poolId, newBudgetData);

    // In a real app, you would also save this to the database
    // For now, we'll store it locally and sync with the VIP Pools hook

    return newProfit;
  };

  const deductVipPoolStake = async (poolId, stakeAmount) => {
    if (!poolId) return 0;
    const poolBudget = getVipPoolBudget(poolId);
    const profitChange = Math.round(-stakeAmount * 100) / 100;
    const currentProfit = poolBudget.profit || 0;
    const newProfit = Math.round((currentProfit + profitChange) * 100) / 100;

    const newBudgetData = {
      ...poolBudget,
      profit: newProfit
    };

    await updateVipPoolBudget(poolId, newBudgetData);
    return newProfit;
  };

  const resolveVipPoolPendingBet = async (poolId, stakeAmount, potentialWin, isWin) => {
    if (!poolId) return 0;
    const poolBudget = getVipPoolBudget(poolId);

    // Calculate the adjustment needed
    let profitAdjustment;
    if (isWin) {
      // Add back the full win amount (since stake was already deducted)
      profitAdjustment = Math.round(potentialWin * 100) / 100;
    } else {
      // For loss, stake was already deducted, so no additional change needed
      profitAdjustment = 0;
    }

    const currentProfit = poolBudget.profit || 0;
    const currentBets = poolBudget.bets || 0;
    const currentWins = poolBudget.wins || 0;

    const newProfit = Math.round((currentProfit + profitAdjustment) * 100) / 100;
    const newBets = currentBets + 1;
    const newWins = isWin ? currentWins + 1 : currentWins;
    const newWinRate = Math.round((newWins / newBets) * 1000) / 10;

    const newBudgetData = {
      ...poolBudget,
      profit: newProfit,
      bets: newBets,
      wins: newWins,
      winRate: newWinRate
    };

    await updateVipPoolBudget(poolId, newBudgetData);
    return newProfit;
  };

  return {
    betLeagueProfit: budgetData.betLeagueProfit,
    myTeamLeagueProfit: budgetData.myTeamLeagueProfit,
    customLeagueBudgets: budgetData.customLeagueBudgets,
    vipPoolBudgets: budgetData.customLeagueBudgets, // Alias for VIP Pools compatibility
    loading: budgetData.loading,
    getAvailableBudget,
    canPlaceTicket,
    updateProfit,
    deductStake,
    resolvePendingBet,
    getCurrentProfit,
    refetch,
    // VIP Pool functions (original names)
    getVipPoolBudget,
    updateVipPoolBudget,
    getAvailableVipPoolBudget: getAvailablePoolBudget,
    canPlaceVipPoolBet: canPlacePoolBet,
    updateVipPoolProfit,
    deductVipPoolStake,
    resolveVipPoolPendingBet,
    // Custom League functions (aliases)
    getCustomLeagueBudget: getVipPoolBudget,
    updateCustomLeagueBudget: updateVipPoolBudget,
    getAvailableCustomLeagueBudget: getAvailablePoolBudget,
    canPlaceCustomLeagueBet: canPlacePoolBet,
    updateCustomLeagueProfit: updateVipPoolProfit,
    deductCustomLeagueStake: deductVipPoolStake,
    resolveCustomLeaguePendingBet: resolveVipPoolPendingBet
  };
};