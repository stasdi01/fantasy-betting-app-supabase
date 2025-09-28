import React from 'react';
import { TrendingUp, Users, Target, Award, BarChart3, Crown } from 'lucide-react';
import '../../styles/PerformanceInsights.css';

const PerformanceInsights = ({ insights, loading }) => {
  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'max': return <Crown size={16} className="role-icon max" />;
      case 'pro': return <Award size={16} className="role-icon pro" />;
      case 'free': return <Users size={16} className="role-icon free" />;
      default: return <Users size={16} className="role-icon free" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'max': return '#ffd700';
      case 'pro': return '#8a2be2';
      case 'free': return '#6b7280';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="performance-insights-container">
        <div className="insights-header">
          <BarChart3 size={24} />
          <div>
            <h2>Performance Insights</h2>
            <p>Analytics from top performers</p>
          </div>
        </div>
        <div className="insights-loading">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="insight-skeleton">
              <div className="skeleton-icon"></div>
              <div className="skeleton-content">
                <div className="skeleton-title"></div>
                <div className="skeleton-value"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="performance-insights-container">
        <div className="insights-header">
          <BarChart3 size={24} />
          <div>
            <h2>Performance Insights</h2>
            <p>Analytics from top performers</p>
          </div>
        </div>
        <div className="insights-empty">
          <Target size={48} />
          <h3>No Insights Available</h3>
          <p>Insights will appear when performance data is available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="performance-insights-container">
      <div className="insights-header">
        <BarChart3 size={24} />
        <div>
          <h2>Performance Insights</h2>
          <p>Analytics from top performers</p>
        </div>
      </div>

      <div className="insights-grid">
        {/* Average Profit */}
        <div className="insight-card primary">
          <div className="insight-icon">
            <TrendingUp size={24} />
          </div>
          <div className="insight-content">
            <h3>Average Profit</h3>
            <div className="insight-value">
              {formatPercentage(insights.averageProfit)}
            </div>
            <p>Average performance of top 10</p>
          </div>
        </div>

        {/* Best Performer */}
        <div className="insight-card highlight">
          <div className="insight-icon">
            <Crown size={24} />
          </div>
          <div className="insight-content">
            <h3>Top Performer</h3>
            <div className="insight-value">
              {insights.bestPerformer?.username}
            </div>
            <p>{formatPercentage(insights.bestPerformer?.totalProfit || 0)}</p>
          </div>
        </div>

        {/* Most Consistent */}
        <div className="insight-card success">
          <div className="insight-icon">
            <Award size={24} />
          </div>
          <div className="insight-content">
            <h3>Most Consistent</h3>
            <div className="insight-value">
              {insights.mostConsistent?.username}
            </div>
            <p>Top in both leagues</p>
          </div>
        </div>

        {/* Prediction Stats */}
        <div className="insight-card info">
          <div className="insight-icon">
            <Target size={24} />
          </div>
          <div className="insight-content">
            <h3>Win Rate</h3>
            <div className="insight-value">
              {insights.predictionPatterns?.winRate ? `${insights.predictionPatterns.winRate.toFixed(1)}%` : 'N/A'}
            </div>
            <p>{insights.predictionPatterns?.totalPredictions || 0} recent predictions</p>
          </div>
        </div>
      </div>

      {/* Role Distribution */}
      <div className="role-distribution-section">
        <h3>Role Distribution</h3>
        <div className="role-distribution">
          {Object.entries(insights.roleDistribution || {}).map(([role, count]) => (
            <div key={role} className="role-item">
              <div className="role-info">
                {getRoleIcon(role)}
                <span className="role-name">{role.toUpperCase()}</span>
              </div>
              <div className="role-count">
                <span className="count-value">{count}</span>
                <span className="count-label">users</span>
              </div>
              <div className="role-bar">
                <div
                  className="role-progress"
                  style={{
                    width: `${(count / 10) * 100}%`,
                    backgroundColor: getRoleColor(role)
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Stats */}
      {insights.predictionPatterns && (
        <div className="additional-stats">
          <h3>Prediction Patterns</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Predictions</span>
              <span className="stat-value">{insights.predictionPatterns.totalPredictions}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Average Stake</span>
              <span className="stat-value">
                {insights.predictionPatterns.averageStake ?
                  `${insights.predictionPatterns.averageStake.toFixed(1)}%` :
                  'N/A'
                }
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Win Rate</span>
              <span className="stat-value">
                {insights.predictionPatterns.winRate ?
                  `${insights.predictionPatterns.winRate.toFixed(1)}%` :
                  'N/A'
                }
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceInsights;