import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage, logError } from '../utils/errorHandler';

export const useBudget = () => {
  const { user, profile } = useAuth();
  const [budgetData, setBudgetData] = useState({
    freeProfit: 0,
    premiumProfit: 0,
    loading: true
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const getCurrentMonthKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  const fetchBudgetData = useCallback(async () => {
    if (!user) {
      setBudgetData({ freeProfit: 0, premiumProfit: 0, loading: false });
      return;
    }

    try {
      const monthKey = getCurrentMonthKey();

      const { data, error } = await supabase
        .from('monthly_budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_year', monthKey)
        .single();

      if (error && error.code !== 'PGRST116') {
        logError(error, 'useBudget.fetchBudgetData');
        setBudgetData({ freeProfit: 0, premiumProfit: 0, loading: false });
        return;
      }

      if (data) {
        setBudgetData({
          freeProfit: parseFloat(data.free_profit) || 0,
          premiumProfit: parseFloat(data.premium_profit) || 0,
          loading: false
        });
      } else {
        // Create new month budget entry
        const { data: newBudget, error: insertError } = await supabase
          .from('monthly_budgets')
          .insert([
            {
              user_id: user.id,
              month_year: monthKey,
              free_profit: 0,
              premium_profit: 0
            }
          ])
          .select()
          .single();

        if (insertError) {
          logError(insertError, 'useBudget.fetchBudgetData.createBudget');
        }

        setBudgetData({
          freeProfit: 0,
          premiumProfit: 0,
          loading: false
        });
      }
    } catch (error) {
      logError(error, 'useBudget.fetchBudgetData');
      setBudgetData({ freeProfit: 0, premiumProfit: 0, loading: false });
    }
  }, [user]);

  useEffect(() => {
    fetchBudgetData();
  }, [user, refreshKey, fetchBudgetData]);

  useEffect(() => {
    const handleProfitUpdate = () => {
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('profit-updated', handleProfitUpdate);
    return () => window.removeEventListener('profit-updated', handleProfitUpdate);
  }, []);

  const getAvailableBudget = (isPremiumBet = false) => {
    if (!profile) {
      return 0;
    }

    const isPremium = profile.role === 'premium' &&
                     profile.premium_expires_at &&
                     new Date(profile.premium_expires_at) > new Date();

    if (isPremiumBet && isPremium) {
      // Premium bet: uses premium budget (100% + premium_profit)
      return Math.max(0, 100 + budgetData.premiumProfit);
    } else {
      // Free bet: uses free budget
      const baseBudget = isPremium ? 150 : 100; // Premium users get 150% for free bets
      return Math.max(0, baseBudget + budgetData.freeProfit);
    }
  };

  const canPlaceTicket = (stakeAmount, isPremiumBet = false) => {
    const availableBudget = getAvailableBudget(isPremiumBet);

    if (isPremiumBet) {
      // Premium bet validation
      const premiumLimit = 100 + budgetData.premiumProfit;
      if (premiumLimit <= -100) {
        return {
          canPlace: false,
          reason: "Premium account blocked. You've reached -100% profit limit on premium bets."
        };
      }
    } else {
      // Free bet validation
      const freeLimit = (profile?.role === 'premium' ? 150 : 100) + budgetData.freeProfit;
      if (freeLimit <= -100) {
        return {
          canPlace: false,
          reason: "Account blocked. You've reached -100% profit limit."
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

  const updateProfit = async (stakeAmount, potentialWin, isWin, isPremiumBet = false) => {
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
        logError(error, 'useBudget.updateProfit');
        return;
      }

      // Update local state
      setBudgetData(prev => ({
        ...prev,
        [isPremiumBet ? 'premiumProfit' : 'freeProfit']: newProfit
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

  const getCurrentProfit = (isPremiumBet = false) => {
    return isPremiumBet ? budgetData.premiumProfit : budgetData.freeProfit;
  };

  const refetch = () => {
    setRefreshKey(prev => prev + 1);
  };

  return {
    freeProfit: budgetData.freeProfit,
    premiumProfit: budgetData.premiumProfit,
    loading: budgetData.loading,
    getAvailableBudget,
    canPlaceTicket,
    updateProfit,
    deductStake,
    resolvePendingBet,
    getCurrentProfit,
    refetch
  };
};