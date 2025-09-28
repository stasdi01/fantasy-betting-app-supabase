import React from 'react';
import { Calendar, TrendingUp, Target, Trophy, Clock } from 'lucide-react';
import '../../styles/RecentPredictions.css';

const RecentPredictions = ({ predictions, loading }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'won': return <TrendingUp size={16} className="status-icon won" />;
      case 'lost': return <Target size={16} className="status-icon lost" />;
      case 'pending': return <Clock size={16} className="status-icon pending" />;
      default: return <Clock size={16} className="status-icon pending" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'won': return 'won';
      case 'lost': return 'lost';
      case 'pending': return 'pending';
      default: return 'pending';
    }
  };

  const getPredictionTypeLabel = (type) => {
    switch (type) {
      case 'match': return 'Match Prediction';
      case 'player': return 'Player Performance';
      default: return 'Prediction';
    }
  };

  if (loading) {
    return (
      <div className="recent-predictions-container">
        <div className="section-header">
          <Trophy size={24} />
          <div>
            <h2>Recent Expert Predictions</h2>
            <p>Latest predictions from top performers</p>
          </div>
        </div>
        <div className="loading-predictions">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="prediction-skeleton">
              <div className="skeleton-header"></div>
              <div className="skeleton-content"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!predictions || predictions.length === 0) {
    return (
      <div className="recent-predictions-container">
        <div className="section-header">
          <Trophy size={24} />
          <div>
            <h2>Recent Expert Predictions</h2>
            <p>Latest predictions from top performers</p>
          </div>
        </div>
        <div className="empty-predictions">
          <Target size={48} />
          <h3>No Recent Predictions</h3>
          <p>Top performers haven't made any predictions yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-predictions-container">
      <div className="section-header">
        <Trophy size={24} />
        <div>
          <h2>Recent Expert Predictions</h2>
          <p>Latest predictions from top performers ({predictions.length})</p>
        </div>
      </div>

      <div className="predictions-list">
        {predictions.map((prediction, index) => (
          <div key={prediction.id || index} className={`prediction-card ${getStatusClass(prediction.status)}`}>
            <div className="prediction-header">
              <div className="performer-info">
                <div className="performer-rank">
                  {prediction.performerRank && `#${prediction.performerRank}`}
                </div>
                <div className="performer-details">
                  <span className="performer-name">{prediction.users?.username}</span>
                  <span className="performer-profit">
                    {prediction.performerProfit >= 0 ? '+' : ''}{prediction.performerProfit.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="prediction-status">
                {getStatusIcon(prediction.status)}
                <span className="status-text">{prediction.status}</span>
              </div>
            </div>

            <div className="prediction-content">
              <div className="prediction-type">
                <span className="type-label">{getPredictionTypeLabel(prediction.prediction_type)}</span>
                <span className="prediction-date">
                  <Calendar size={14} />
                  {formatDate(prediction.created_at)}
                </span>
              </div>

              <div className="prediction-details">
                {prediction.match_info && (
                  <div className="match-info">
                    <strong>{prediction.match_info.home_team} vs {prediction.match_info.away_team}</strong>
                    <span className="prediction-choice">Prediction: {prediction.prediction_choice}</span>
                  </div>
                )}

                {prediction.player_info && (
                  <div className="player-info">
                    <strong>{prediction.player_info.name}</strong>
                    <span className="prediction-choice">Expected: {prediction.prediction_choice}</span>
                  </div>
                )}

                {prediction.description && (
                  <p className="prediction-description">{prediction.description}</p>
                )}
              </div>

              <div className="prediction-meta">
                <div className="stake-info">
                  <span className="stake-label">Stake:</span>
                  <span className="stake-amount">{prediction.stake_amount || 0}%</span>
                </div>
                {prediction.potential_return && (
                  <div className="return-info">
                    <span className="return-label">Potential Return:</span>
                    <span className="return-amount">+{prediction.potential_return.toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentPredictions;