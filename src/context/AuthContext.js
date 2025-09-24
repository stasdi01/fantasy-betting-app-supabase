import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getAuthErrorMessage, logError } from '../utils/errorHandler';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Force loading off after 2 seconds maximum
    const timeout = setTimeout(() => setLoading(false), 2000);

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          fetchUserProfile(session.user.id);
        }
      } catch (error) {
        // Ignore errors, just stop loading
      }
      clearTimeout(timeout);
      setLoading(false);
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
          fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      clearTimeout(timeout);
      subscription?.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const pendingUsername = localStorage.getItem('pendingUsername');

        if (pendingUsername) {
          const { data: { user } } = await supabase.auth.getUser();

          const profileData = {
            id: userId,
            email: user?.email || '',
            username: pendingUsername,
            role: 'free'
          };

          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert([profileData])
            .select()
            .single();

          if (!createError) {
            setProfile(newProfile);
            localStorage.removeItem('pendingUsername');
          }
        }
      } else if (!error) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const signUp = async (email, password, username) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      });

      if (error) {
        const errorMessage = getAuthErrorMessage(error);
        logError(error, 'AuthContext.signUp');
        return { data: null, error: { message: errorMessage } };
      }

      // Profile will be created in the auth state change listener
      if (data.user) {
        // Store username temporarily for profile creation
        localStorage.setItem('pendingUsername', username);
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error);
      logError(error, 'AuthContext.signUp');
      return { data: null, error: { message: errorMessage } };
    }
  };

  const signIn = async (username, password) => {
    try {
      // First, find the email by username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('username', username)
        .single();

      if (userError || !userData) {
        const errorMessage = getAuthErrorMessage({ message: 'Username not found' });
        logError(userError || new Error('Username not found'), 'AuthContext.signIn');
        return { data: null, error: { message: errorMessage } };
      }

      // Then sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password
      });

      if (error) {
        const errorMessage = getAuthErrorMessage(error);
        logError(error, 'AuthContext.signIn');
        return { data: null, error: { message: errorMessage } };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error);
      logError(error, 'AuthContext.signIn');
      return { data: null, error: { message: errorMessage } };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const isAuthenticated = !!user;
  const isPremium = profile?.role === 'premium' &&
                   profile?.premium_expires_at &&
                   new Date(profile.premium_expires_at) > new Date();

  const value = {
    user,
    profile,
    loading,
    isAuthenticated,
    isPremium,
    signUp,
    signIn,
    signOut,
    updateProfile,
    fetchUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};