import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage, logError } from '../utils/errorHandler';

export const useCustomLeagues = () => {
  const { user, profile } = useAuth();
  const [leagues, setLeagues] = useState([]);
  const [joinedLeagues, setJoinedLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Fetch leagues created by the user
  const fetchUserLeagues = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('custom_leagues')
        .select(`
          *,
          league_memberships(count)
        `)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLeagues(data || []);
    } catch (error) {
      console.error('Error fetching user leagues:', error);
      logError(error, 'useCustomLeagues.fetchUserLeagues');
    }
  }, [user]);

  // Fetch leagues the user has joined
  const fetchJoinedLeagues = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('league_memberships')
        .select(`
          *,
          custom_leagues(*)
        `)
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false });

      if (error) throw error;

      setJoinedLeagues(data || []);
    } catch (error) {
      console.error('Error fetching joined leagues:', error);
      logError(error, 'useCustomLeagues.fetchJoinedLeagues');
    }
  }, [user]);

  // Load all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUserLeagues(),
        fetchJoinedLeagues()
      ]);
    } finally {
      setLoading(false);
    }
  }, [fetchUserLeagues, fetchJoinedLeagues]);

  // Create a new league
  const createLeague = async (leagueData) => {
    if (!user || !profile) {
      throw new Error('You must be logged in to create a league');
    }

    // Check user limits
    const maxLeagues = profile.role === 'max' ? Infinity : (profile.role === 'pro' ? 2 : 0);
    if (profile.role === 'free') {
      throw new Error('Creating custom leagues requires a PRO or MAX subscription');
    }
    if (leagues.length >= maxLeagues) {
      throw new Error(`You can only create ${maxLeagues} leagues with your current plan`);
    }

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('custom_leagues')
        .insert([{
          ...leagueData,
          creator_id: user.id,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Automatically join the creator as a member (direct insert to avoid duplicate check)
      const { error: membershipError } = await supabase
        .from('league_memberships')
        .insert([{
          league_id: data.id,
          user_id: user.id,
          joined_at: new Date().toISOString()
        }]);

      if (membershipError) throw membershipError;

      await fetchData();

      // Dispatch event to notify components of league updates
      window.dispatchEvent(new CustomEvent('custom-leagues-updated'));

      return data;
    } catch (error) {
      console.error('Error creating league:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        status: error?.status,
        details: error?.details,
        hint: error?.hint,
        stack: error?.stack
      });
      logError(error, 'useCustomLeagues.createLeague');

      // More specific error messages
      if (error?.message?.includes('relation') && error?.message?.includes('does not exist')) {
        throw new Error('Database tables are not set up correctly. Please contact support.');
      }
      if (error?.code === '42P01') {
        throw new Error('Required database tables are missing. Please contact support.');
      }
      if (error?.code === '23505') {
        throw new Error('A league with this name already exists. Please choose a different name.');
      }
      if (error?.message?.includes('permission') || error?.code === '42501') {
        throw new Error('You do not have permission to create leagues. Please check your subscription.');
      }

      throw new Error(error?.message || getErrorMessage(error));
    } finally {
      setCreating(false);
    }
  };

  // Join a league
  const joinLeague = async (leagueId) => {
    if (!user) {
      throw new Error('You must be logged in to join a league');
    }

    try {
      // Check if already a member
      const { data: existingMembership } = await supabase
        .from('league_memberships')
        .select('id')
        .eq('league_id', leagueId)
        .eq('user_id', user.id)
        .single();

      if (existingMembership) {
        throw new Error('You are already a member of this league');
      }

      // Get league info to check capacity
      const { data: league, error: leagueError } = await supabase
        .from('custom_leagues')
        .select('max_members')
        .eq('id', leagueId)
        .single();

      if (leagueError) throw leagueError;

      // Check current member count
      const { count: memberCount, error: countError } = await supabase
        .from('league_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('league_id', leagueId);

      if (countError) throw countError;

      if (memberCount >= league.max_members) {
        throw new Error('This league is full');
      }

      // Join the league
      const { error } = await supabase
        .from('league_memberships')
        .insert([{
          league_id: leagueId,
          user_id: user.id,
          joined_at: new Date().toISOString()
        }]);

      if (error) throw error;

      await fetchData();

      // Dispatch event to notify components of league updates
      window.dispatchEvent(new CustomEvent('custom-leagues-updated'));
    } catch (error) {
      console.error('Error joining league:', error);
      logError(error, 'useCustomLeagues.joinLeague');
      throw new Error(getErrorMessage(error));
    }
  };

  // Leave a league
  const leaveLeague = async (leagueId) => {
    if (!user) {
      throw new Error('You must be logged in to leave a league');
    }

    try {
      const { error } = await supabase
        .from('league_memberships')
        .delete()
        .eq('league_id', leagueId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchData();

      // Dispatch event to notify components of league updates
      window.dispatchEvent(new CustomEvent('custom-leagues-updated'));
    } catch (error) {
      console.error('Error leaving league:', error);
      logError(error, 'useCustomLeagues.leaveLeague');
      throw new Error(getErrorMessage(error));
    }
  };

  // Delete a league (only creator can do this)
  const deleteLeague = async (leagueId) => {
    if (!user) {
      throw new Error('You must be logged in to delete a league');
    }

    try {
      // First delete all memberships
      await supabase
        .from('league_memberships')
        .delete()
        .eq('league_id', leagueId);

      // Then delete the league
      const { error } = await supabase
        .from('custom_leagues')
        .delete()
        .eq('id', leagueId)
        .eq('creator_id', user.id); // Only creator can delete

      if (error) throw error;

      await fetchData();

      // Dispatch event to notify components of league updates
      window.dispatchEvent(new CustomEvent('custom-leagues-updated'));
    } catch (error) {
      console.error('Error deleting league:', error);
      logError(error, 'useCustomLeagues.deleteLeague');
      throw new Error(getErrorMessage(error));
    }
  };

  // Find public leagues to join
  const findPublicLeagues = async (searchTerm = '') => {
    try {
      let query = supabase
        .from('custom_leagues')
        .select(`
          *,
          league_memberships(count),
          users!custom_leagues_creator_id_fkey(username)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error finding public leagues:', error);
      logError(error, 'useCustomLeagues.findPublicLeagues');
      throw new Error(getErrorMessage(error));
    }
  };

  // Get league limits based on user role
  const getLeagueLimits = () => {
    if (!profile) return { maxLeagues: 0, maxMembers: 0 };

    switch (profile.role) {
      case 'pro':
        return { maxLeagues: 2, maxMembers: 10 };
      case 'max':
        return { maxLeagues: Infinity, maxMembers: 100 };
      default:
        return { maxLeagues: 0, maxMembers: 0 };
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setLeagues([]);
      setJoinedLeagues([]);
      setLoading(false);
    }
  }, [user, fetchData]);

  return {
    leagues,
    joinedLeagues,
    loading,
    creating,
    createLeague,
    joinLeague,
    leaveLeague,
    deleteLeague,
    findPublicLeagues,
    getLeagueLimits,
    refreshData: fetchData
  };
};