import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Users, Trophy, TrendingUp, Calendar, Crown,
  Target, Medal, Star, Flame, Gamepad2, User, Award, UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast/ToastProvider';
import { useBudget } from '../hooks/useBudget';
import LoadingSpinner from '../components/Loading/LoadingSpinner';
import { supabase } from '../lib/supabase';
import '../styles/LeagueDetail.css';

const LeagueDetail = () => {
  const { leagueId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const { getCustomLeagueBudget } = useBudget();

  const [league, setLeague] = useState(null);
  const [members, setMembers] = useState([]);
  const [memberStats, setMemberStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [userMembership, setUserMembership] = useState(null);

  // Fetch league details and members
  useEffect(() => {
    const fetchLeagueData = async () => {
      if (!user || !leagueId) return;

      setLoading(true);
      try {
        // Fetch league details
        const { data: leagueData, error: leagueError } = await supabase
          .from('custom_leagues')
          .select(`
            *,
            users!custom_leagues_creator_id_fkey(username)
          `)
          .eq('id', leagueId)
          .single();

        if (leagueError) throw leagueError;
        setLeague(leagueData);

        // Check if current user is a member
        const { data: membershipData } = await supabase
          .from('league_memberships')
          .select('*')
          .eq('league_id', leagueId)
          .eq('user_id', user.id)
          .single();

        setUserMembership(membershipData);

        // Check if user can view this league (member, creator, or public)
        const canView = membershipData ||
                       leagueData.creator_id === user.id ||
                       leagueData.is_public;

        if (!canView) {
          throw new Error('You do not have permission to view this league');
        }

        // Fetch league members
        const { data: membersData, error: membersError } = await supabase
          .from('league_memberships')
          .select(`
            *,
            users(id, username, created_at)
          `)
          .eq('league_id', leagueId)
          .order('joined_at', { ascending: true });

        if (membersError) throw membersError;
        setMembers(membersData || []);

        // Fetch real custom league budget stats for members
        const { data: budgetData, error: budgetError } = await supabase
          .from('custom_league_budgets')
          .select('*')
          .eq('league_id', leagueId);

        if (budgetError) {
          console.error('Error fetching budget data:', budgetError);
        }

        // Create budget lookup by user_id
        const budgetLookup = {};
        if (budgetData) {
          budgetData.forEach(budget => {
            budgetLookup[budget.user_id] = budget;
          });
        }

        // Generate stats data with real budget information
        const statsData = membersData.map((member, index) => {
          const userBudget = budgetLookup[member.users.id];

          return {
            userId: member.users.id,
            username: member.users.username,
            joinedAt: member.joined_at,
            // Real data from custom_league_budgets table
            profit: userBudget ? parseFloat(userBudget.profit) || 0 : 0,
            totalBets: userBudget ? userBudget.bets || 0 : 0,
            winRate: userBudget ? parseFloat(userBudget.win_rate) || 0 : 0,
            wins: userBudget ? userBudget.wins || 0 : 0,
            bestStreak: userBudget ? Math.max(userBudget.wins || 0, 1) : 0, // Simple calculation
            rank: index + 1,
            teamName: leagueData.league_type === 'myteam' ? `${member.users.username}'s Team` : null,
            isCreator: member.users.id === leagueData.creator_id
          };
        });

        // Sort by profit for leaderboard
        statsData.sort((a, b) => b.profit - a.profit);
        statsData.forEach((stat, index) => {
          stat.rank = index + 1;
        });

        setMemberStats(statsData);

      } catch (error) {
        console.error('Error fetching league data:', error);
        showError('Failed to load league details');
      } finally {
        setLoading(false);
      }
    };

    fetchLeagueData();
  }, [user, leagueId, showError]);

  // Join league function
  const handleJoinLeague = async () => {
    if (!user || !league || userMembership) return;

    setJoining(true);
    try {
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

      success(`Successfully joined "${league.name}"!`);

      // Refresh data
      window.location.reload();

    } catch (error) {
      console.error('Error joining league:', error);
      showError(error.message || 'Failed to join league');
    } finally {
      setJoining(false);
    }
  };

  const getProfitColor = (profit) => {
    return profit >= 0 ? "var(--success)" : "var(--danger)";
  };

  const getRankMedal = (rank) => {
    switch (rank) {
      case 1: return { icon: <Crown size={20} />, color: '#ffd700' };
      case 2: return { icon: <Medal size={20} />, color: '#c0c0c0' };
      case 3: return { icon: <Award size={20} />, color: '#cd7f32' };
      default: return { icon: <span>#{rank}</span>, color: 'var(--text-muted)' };
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="league-detail-loading">
        <LoadingSpinner size="lg" />
        <p>Loading league details...</p>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="league-detail-error">
        <h2>League not found</h2>
        <button onClick={() => navigate('/your-leagues')} className="btn-primary">
          <ArrowLeft size={18} />
          Back to Leagues
        </button>
      </div>
    );
  }

  return (
    <div className="league-detail-container">
      {/* Header */}
      <div className="league-detail-header">
        <button
          className="back-button"
          onClick={() => navigate('/your-leagues')}
        >
          <ArrowLeft size={20} />
          Back to Leagues
        </button>

        <div className="league-hero">
          <div className="league-hero-background">
            <div className="hero-gradient"></div>
          </div>

          <div className="league-hero-content">
            <div className="league-icon">
              {league.league_type === 'bet' ? (
                <Trophy size={48} />
              ) : (
                <Gamepad2 size={48} />
              )}
            </div>

            <div className="league-info">
              <h1>{league.name}</h1>
              <p className="league-description">{league.description || 'No description'}</p>

              <div className="league-meta">
                <div className="meta-item">
                  <span className="meta-label">Type:</span>
                  <span className="meta-value">
                    {league.league_type === 'bet' ? '🏆 BetLeague' : '🎯 MyTeam League'}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Privacy:</span>
                  <span className="meta-value">
                    {league.is_public ? '🌐 Public' : '🔒 Private'}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Creator:</span>
                  <span className="meta-value">
                    <User size={16} />
                    {league.users?.username}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Created:</span>
                  <span className="meta-value">
                    <Calendar size={16} />
                    {formatDate(league.created_at)}
                  </span>
                </div>
              </div>
            </div>

            <div className="league-stats-overview">
              <div className="stat-card">
                <Users size={24} />
                <div>
                  <span className="stat-number">{members.length}</span>
                  <span className="stat-label">Members</span>
                </div>
              </div>
              <div className="stat-card">
                <Target size={24} />
                <div>
                  <span className="stat-number">{league.max_members}</span>
                  <span className="stat-label">Max</span>
                </div>
              </div>
              <div className="stat-card">
                <TrendingUp size={24} />
                <div>
                  <span className="stat-number">
                    {memberStats.length > 0 ? `${memberStats[0].profit.toFixed(1)}%` : '0%'}
                  </span>
                  <span className="stat-label">Top Profit</span>
                </div>
              </div>

              {/* Current user's profit for this league */}
              {userMembership && (
                <div className="stat-card current-user-profit">
                  <User size={24} />
                  <div>
                    <span
                      className={`stat-number ${getCustomLeagueBudget(leagueId).profit >= 0 ? 'positive' : 'negative'}`}
                    >
                      {getCustomLeagueBudget(leagueId).profit >= 0 ? '+' : ''}{getCustomLeagueBudget(leagueId).profit.toFixed(1)}%
                    </span>
                    <span className="stat-label">Your Profit</span>
                  </div>
                </div>
              )}

              {/* Join button for non-members */}
              {!userMembership && league.creator_id !== user.id && league.is_public && (
                <div className="join-league-section">
                  <button
                    className="join-league-btn"
                    onClick={handleJoinLeague}
                    disabled={joining || members.length >= league.max_members}
                  >
                    {joining ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      <UserPlus size={20} />
                    )}
                    {members.length >= league.max_members
                      ? 'League Full'
                      : joining
                      ? 'Joining...'
                      : 'Join League'
                    }
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Members Leaderboard */}
      <div className="league-content">
        <div className="leaderboard-section">
          <div className="section-header">
            <div className="section-title">
              <Medal size={24} />
              <h2>League Leaderboard</h2>
            </div>
            <div className="section-subtitle">
              {league.league_type === 'bet'
                ? 'Ranked by betting profits'
                : 'Ranked by team performance'
              }
            </div>
          </div>

          {memberStats.length === 0 ? (
            <div className="empty-leaderboard">
              <Users size={64} />
              <h3>No members yet</h3>
              <p>This league doesn't have any members with stats yet.</p>
            </div>
          ) : (
            <div className="members-leaderboard">
              {memberStats.map((member) => {
                const rankInfo = getRankMedal(member.rank);
                const isCurrentUser = member.userId === user.id;

                return (
                  <div
                    key={member.userId}
                    className={`member-card ${isCurrentUser ? 'current-user' : ''} ${member.rank <= 3 ? 'top-three' : ''}`}
                  >
                    <div className="member-rank" style={{ color: rankInfo.color }}>
                      {rankInfo.icon}
                    </div>

                    <div className="member-info">
                      <div className="member-avatar">
                        <User size={32} />
                      </div>
                      <div className="member-details">
                        <h4 className="member-name">
                          {league.league_type === 'myteam' ? member.teamName : member.username}
                          {isCurrentUser && <span className="you-badge">You</span>}
                          {member.isCreator && <span className="creator-badge">Creator</span>}
                        </h4>
                        {league.league_type === 'myteam' && (
                          <p className="member-username">by {member.username}</p>
                        )}
                        <div className="member-joined">
                          <Calendar size={14} />
                          Joined {formatDate(member.joinedAt)}
                        </div>
                      </div>
                    </div>

                    <div className="member-stats">
                      <div className="stat-group">
                        <div className="stat-item">
                          <span className="stat-label">
                            {league.league_type === 'bet' ? 'Profit' : 'Score'}
                          </span>
                          <span
                            className="stat-value profit"
                            style={{ color: getProfitColor(member.profit) }}
                          >
                            {member.profit >= 0 ? '+' : ''}{member.profit.toFixed(1)}%
                          </span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">
                            {league.league_type === 'bet' ? 'Bets' : 'Predictions'}
                          </span>
                          <span className="stat-value">{member.totalBets}</span>
                        </div>
                      </div>
                      <div className="stat-group">
                        <div className="stat-item">
                          <span className="stat-label">Win Rate</span>
                          <span className="stat-value">{member.winRate.toFixed(1)}%</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Best Streak</span>
                          <span className="stat-value">
                            {member.bestStreak}
                            <Flame size={14} className="streak-icon" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeagueDetail;