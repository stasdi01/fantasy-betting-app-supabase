import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, RefreshCw, Shield, Target } from 'lucide-react';
import { useVipTeam } from '../hooks/useVipTeam';
import RecentPredictions from '../components/VipTeam/RecentPredictions';
import { useToast } from '../components/Toast/ToastProvider';
import { useAuth } from '../context/AuthContext';
import '../styles/VipTeam.css';

const VipTeam = () => {
  const {
    hasVipAccess,
    recentPredictions,
    loading,
    refreshData
  } = useVipTeam();

  const toast = useToast();
  const navigate = useNavigate();
  const { isMax } = useAuth();
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
  if (!isMax) {
    return (
      <div className="vip-team-container">
        {/* Attractive Marketing Header */}
        <div className="vip-marketing-header">
          <div className="marketing-background">
            <div className="gradient-orb orb-1"></div>
            <div className="gradient-orb orb-2"></div>
            <div className="gradient-orb orb-3"></div>
          </div>

          <div className="marketing-content">
            <div className="vip-badge">
              <Crown size={24} />
              <span>VIP TEAM</span>
            </div>

            <h1>Hall of Fame Predictions</h1>
            <p className="subtitle">
              Get exclusive access to predictions from DreamStakes' top 10 highest-performing users
            </p>

            <div className="features-preview">
              <div className="feature-preview">
                <Target size={20} />
                <span>Live predictions from top performers</span>
              </div>
              <div className="feature-preview">
                <Crown size={20} />
                <span>Real-time bet tracking from top 10 users</span>
              </div>
              <div className="feature-preview">
                <Shield size={20} />
                <span>Expert betting strategies & patterns</span>
              </div>
            </div>

            <div className="upgrade-cta">
              <button
                className="cta-btn"
                onClick={() => navigate('/premium')}
              >
                <Shield size={20} />
                Unlock VIP Team - Subscribe to MAX
              </button>
              <p className="cta-note">
                Join the elite circle and follow the strategies of proven winners
              </p>
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
          {/* Expert Predictions from Top 10 */}
          <div className="expert-predictions-section">
            <div className="section-header">
              <Target size={24} />
              <div>
                <h2>Expert Predictions</h2>
                <p>Latest bets from the top 10 leaderboard performers</p>
              </div>
            </div>

            <RecentPredictions predictions={recentPredictions} loading={loading} />
          </div>
        </div>
      )}
    </div>
  );
};

export default VipTeam;