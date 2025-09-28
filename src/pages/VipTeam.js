import React, { useState } from 'react';
import { Crown, RefreshCw, Lock, Shield, Trophy, TrendingUp, Target } from 'lucide-react';
import { useVipTeam } from '../hooks/useVipTeam';
import TopPerformerCard from '../components/VipTeam/TopPerformerCard';
import RecentPredictions from '../components/VipTeam/RecentPredictions';
import PerformanceInsights from '../components/VipTeam/PerformanceInsights';
import { useToast } from '../components/Toast/ToastProvider';
import '../styles/VipTeam.css';

const VipTeam = () => {
  const {
    hasVipAccess,
    topPerformers,
    leaderboardData,
    recentPredictions,
    performanceInsights,
    loading,
    refreshData
  } = useVipTeam();

  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      refreshData();
      toast.success('VIP Team data refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  // Access denied screen for non-MAX users
  if (!hasVipAccess) {
    return (
      <div className="vip-team-container">
        <div className="vip-team-header">
          <div className="header-content">
            <Crown size={32} />
            <div className="header-text">
              <h1>VIP Team</h1>
              <p>Exclusive access to top performers' predictions and insights</p>
            </div>
          </div>
        </div>

        <div className="access-denied">
          <div className="access-denied-content">
            <Lock size={64} />
            <h2>Premium MAX Required</h2>
            <p>
              Get exclusive access to the Hall of Fame - see what the best predictors in Betify are betting on.
              This premium feature is only available to MAX subscribers.
            </p>

            <div className="feature-highlights">
              <div className="feature-item">
                <Trophy size={24} />
                <div>
                  <h3>Top 10 Hall of Fame</h3>
                  <p>Real-time access to predictions from the highest-performing users in both BetLeague and MyTeam competitions.</p>
                </div>
              </div>
              <div className="feature-item">
                <TrendingUp size={24} />
                <div>
                  <h3>Performance Analytics</h3>
                  <p>Detailed statistics and prediction patterns from top performers to help improve your strategy.</p>
                </div>
              </div>
              <div className="feature-item">
                <Target size={24} />
                <div>
                  <h3>Expert Predictions</h3>
                  <p>Follow the latest predictions from users with proven track records and consistent profits.</p>
                </div>
              </div>
            </div>

            <div className="upgrade-prompt">
              <Shield size={20} />
              <span>Upgrade to Premium MAX to unlock VIP Team access!</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vip-team-container">
      <div className="vip-team-header">
        <div className="header-content">
          <Crown size={32} />
          <div className="header-text">
            <h1>VIP Team</h1>
            <p>Hall of Fame - Top Performers & Expert Predictions</p>
          </div>
        </div>
        <button
          className="refresh-button"
          onClick={handleRefresh}
          disabled={refreshing || loading}
        >
          <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <div className="vip-team-loading">
          <div className="loading-spinner">
            <Crown size={48} className="spinning" />
            <p>Loading VIP Team data...</p>
          </div>
        </div>
      ) : (
        <div className="vip-team-content">
          {/* Top Performers Hall of Fame */}
          <div className="hall-of-fame-section">
            <div className="section-header">
              <Trophy size={24} />
              <div>
                <h2>Hall of Fame</h2>
                <p>Top 10 performers across all leagues ({topPerformers.length} active)</p>
              </div>
            </div>

            {topPerformers.length > 0 ? (
              <div className="performers-grid">
                {topPerformers.map((performer, index) => (
                  <TopPerformerCard
                    key={performer.userId}
                    performer={performer}
                    rank={performer.overallRank || index + 1}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-performers">
                <Crown size={48} />
                <h3>No Top Performers Yet</h3>
                <p>The Hall of Fame will populate as users compete in leagues and build their track records.</p>
              </div>
            )}
          </div>

          {/* Performance Insights */}
          <PerformanceInsights insights={performanceInsights} loading={loading} />

          {/* Recent Expert Predictions */}
          <RecentPredictions predictions={recentPredictions} loading={loading} />

          {/* Additional Stats Summary */}
          {leaderboardData && (leaderboardData.betLeague.length > 0 || leaderboardData.myTeam.length > 0) && (
            <div className="stats-summary">
              <h2>League Leaders Summary</h2>
              <div className="summary-grid">
                {leaderboardData.betLeague.length > 0 && (
                  <div className="summary-card">
                    <h3>BetLeague Top Performer</h3>
                    <div className="top-user">
                      <span className="username">{leaderboardData.betLeague[0]?.users?.username}</span>
                      <span className="profit">
                        +{leaderboardData.betLeague[0]?.bet_league_profit?.toFixed(1) || '0.0'}%
                      </span>
                    </div>
                  </div>
                )}
                {leaderboardData.myTeam.length > 0 && (
                  <div className="summary-card">
                    <h3>MyTeam Top Performer</h3>
                    <div className="top-user">
                      <span className="username">{leaderboardData.myTeam[0]?.users?.username}</span>
                      <span className="profit">
                        +{leaderboardData.myTeam[0]?.profit?.toFixed(1) || '0.0'}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VipTeam;