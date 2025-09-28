import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Crown, Filter, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast/ToastProvider';
import { useCustomLeagues } from '../hooks/useCustomLeagues';
import CreateLeagueModal from '../components/CustomLeagues/CreateLeagueModal';
import LeagueCard from '../components/CustomLeagues/LeagueCard';
import LoadingSpinner from '../components/Loading/LoadingSpinner';
import SkeletonCard from '../components/Loading/SkeletonCard';
import '../styles/YourLeagues.css';

const YourLeagues = () => {
  const { profile, isPremium } = useAuth();
  const { error: showError } = useToast();

  const {
    leagues,
    joinedLeagues,
    loading,
    creating,
    createLeague,
    joinLeague,
    leaveLeague,
    deleteLeague,
    findPublicLeagues,
    getLeagueLimits
  } = useCustomLeagues();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('my-leagues'); // 'my-leagues', 'joined', 'discover'
  const [searchTerm, setSearchTerm] = useState('');
  const [publicLeagues, setPublicLeagues] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all', 'bet', 'myteam'

  const { maxLeagues, maxMembers } = getLeagueLimits();

  // Search for public leagues
  const searchPublicLeagues = async (term = '') => {
    setSearchLoading(true);
    try {
      const results = await findPublicLeagues(term);

      // Filter out leagues user is already a member of
      const userLeagueIds = joinedLeagues.map(jl => jl.custom_leagues?.id);
      const filteredResults = results.filter(league => !userLeagueIds.includes(league.id));

      setPublicLeagues(filteredResults);
    } catch (error) {
      showError(error.message || 'Failed to search leagues');
      setPublicLeagues([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Filter leagues by type
  const filterLeagues = (leaguesList) => {
    if (filterType === 'all') return leaguesList;
    return leaguesList.filter(league => {
      const leagueData = league.custom_leagues || league;
      return leagueData.league_type === filterType;
    });
  };

  // Effect for discovering public leagues when tab changes
  useEffect(() => {
    if (activeTab === 'discover') {
      searchPublicLeagues(searchTerm);
    }
  }, [activeTab, joinedLeagues]);

  // Effect for search
  useEffect(() => {
    if (activeTab === 'discover') {
      const timeoutId = setTimeout(() => {
        searchPublicLeagues(searchTerm);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, activeTab]);

  const handleCreateLeague = async (leagueData) => {
    await createLeague(leagueData);
    setShowCreateModal(false);
  };

  const canCreateLeague = () => {
    if (!isPremium) return false;
    return leagues.length < maxLeagues;
  };

  const getTabCount = (tab) => {
    switch (tab) {
      case 'my-leagues':
        return filterLeagues(leagues).length;
      case 'joined':
        return filterLeagues(joinedLeagues).length;
      case 'discover':
        return filterLeagues(publicLeagues).length;
      default:
        return 0;
    }
  };

  const renderEmptyState = () => {
    if (activeTab === 'my-leagues') {
      return (
        <div className="empty-state">
          <Crown size={64} />
          <h3>No leagues created yet</h3>
          <p>
            {!isPremium
              ? 'Upgrade to PRO or MAX to create custom leagues with friends and family.'
              : 'Create your first custom league to compete with friends and family!'
            }
          </p>
          {isPremium && canCreateLeague() && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <Plus size={18} />
              Create Your First League
            </button>
          )}
        </div>
      );
    }

    if (activeTab === 'joined') {
      return (
        <div className="empty-state">
          <Users size={64} />
          <h3>No leagues joined yet</h3>
          <p>
            Discover and join public leagues, or get invited to private leagues by friends.
          </p>
          <button
            onClick={() => setActiveTab('discover')}
            className="btn-primary"
          >
            <Search size={18} />
            Discover Leagues
          </button>
        </div>
      );
    }

    return (
      <div className="empty-state">
        <Search size={64} />
        <h3>No leagues found</h3>
        <p>
          {searchTerm
            ? `No public leagues found matching "${searchTerm}".`
            : 'No public leagues available at the moment.'
          }
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="your-leagues-container">
        <div className="leagues-header">
          <div className="header-content">
            <h1>Your Leagues</h1>
            <div className="header-skeleton" style={{ height: '1.5rem', width: '300px' }} />
          </div>
        </div>
        <div className="leagues-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} type="league" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="your-leagues-container">
      {/* Header */}
      <div className="leagues-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Your Leagues</h1>
            <p>Create and join custom competitions with friends, family, and other users</p>
          </div>

          {isPremium && (
            <div className="header-actions">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
                disabled={!canCreateLeague() || creating}
              >
                {creating ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  <Plus size={18} />
                )}
                Create League
              </button>
              <div className="league-limits">
                <span>
                  {leagues.length}/{maxLeagues === Infinity ? '∞' : maxLeagues} leagues
                </span>
              </div>
            </div>
          )}
        </div>

        {!isPremium && (
          <div className="upgrade-banner">
            <div className="upgrade-content">
              <Zap size={24} />
              <div>
                <h3>Unlock Custom Leagues</h3>
                <p>Upgrade to PRO or MAX to create custom leagues with friends and family</p>
              </div>
              <button className="btn-upgrade">
                Upgrade Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="leagues-tabs">
        <button
          className={`tab-button ${activeTab === 'my-leagues' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-leagues')}
        >
          <Crown size={16} />
          My Leagues
          <span className="tab-count">{getTabCount('my-leagues')}</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'joined' ? 'active' : ''}`}
          onClick={() => setActiveTab('joined')}
        >
          <Users size={16} />
          Joined
          <span className="tab-count">{getTabCount('joined')}</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'discover' ? 'active' : ''}`}
          onClick={() => setActiveTab('discover')}
        >
          <Search size={16} />
          Discover
          <span className="tab-count">{getTabCount('discover')}</span>
        </button>
      </div>

      {/* Search and Filter Bar */}
      {activeTab === 'discover' && (
        <div className="search-bar">
          <div className="search-input">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search public leagues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            <Filter size={16} />
            All Types
          </button>
          <button
            className={`filter-btn ${filterType === 'bet' ? 'active' : ''}`}
            onClick={() => setFilterType('bet')}
          >
            🏆 BetLeague
          </button>
          <button
            className={`filter-btn ${filterType === 'myteam' ? 'active' : ''}`}
            onClick={() => setFilterType('myteam')}
          >
            🎯 MyTeam
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="leagues-content">
        {searchLoading ? (
          <div className="loading-state">
            <LoadingSpinner />
            <p>Searching leagues...</p>
          </div>
        ) : (
          <>
            {activeTab === 'my-leagues' && (
              <div className="leagues-grid">
                {filterLeagues(leagues).length === 0 ? (
                  renderEmptyState()
                ) : (
                  filterLeagues(leagues).map((league) => (
                    <LeagueCard
                      key={league.id}
                      league={league}
                      isOwner={true}
                      onDelete={deleteLeague}
                    />
                  ))
                )}
              </div>
            )}

            {activeTab === 'joined' && (
              <div className="leagues-grid">
                {filterLeagues(joinedLeagues).length === 0 ? (
                  renderEmptyState()
                ) : (
                  filterLeagues(joinedLeagues).map((membership) => (
                    <LeagueCard
                      key={membership.id}
                      league={membership.custom_leagues}
                      isMember={true}
                      onLeave={leaveLeague}
                    />
                  ))
                )}
              </div>
            )}

            {activeTab === 'discover' && (
              <div className="leagues-grid">
                {filterLeagues(publicLeagues).length === 0 ? (
                  renderEmptyState()
                ) : (
                  filterLeagues(publicLeagues).map((league) => (
                    <LeagueCard
                      key={league.id}
                      league={league}
                      onJoin={joinLeague}
                    />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create League Modal */}
      <CreateLeagueModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onLeagueCreated={handleCreateLeague}
        maxLeagues={maxLeagues}
        maxMembers={maxMembers}
      />
    </div>
  );
};

export default YourLeagues;