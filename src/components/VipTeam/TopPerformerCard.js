import React from 'react';
import { Crown, Trophy, Target, TrendingUp, Star } from 'lucide-react';
import '../../styles/TopPerformerCard.css';

const TopPerformerCard = ({ performer, rank }) => {
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown size={20} className="rank-icon gold" />;
      case 2: return <Trophy size={20} className="rank-icon silver" />;
      case 3: return <Trophy size={20} className="rank-icon bronze" />;
      default: return <Star size={20} className="rank-icon" />;
    }
  };

  const getRankClass = (rank) => {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return 'default';
  };

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'max': return { text: 'MAX', class: 'max' };
      case 'pro': return { text: 'PRO', class: 'pro' };
      default: return { text: 'FREE', class: 'free' };
    }
  };

  const roleInfo = getRoleDisplay(performer.role);

  return (
    <div className={`top-performer-card ${getRankClass(rank)}`}>
      <div className="performer-header">
        <div className="rank-section">
          {getRankIcon(rank)}
          <span className="rank-number">#{rank}</span>
        </div>
        <div className="role-badge">
          <span className={`role-indicator ${roleInfo.class}`}>
            {roleInfo.text}
          </span>
        </div>
      </div>

      <div className="performer-info">
        <h3 className="performer-name">{performer.username}</h3>
        <div className="league-badges">
          {performer.league === 'Both' && (
            <>
              <span className="league-badge bet">🏆 BetLeague</span>
              <span className="league-badge myteam">🎯 MyTeam</span>
            </>
          )}
          {performer.league === 'BetLeague' && (
            <span className="league-badge bet">🏆 BetLeague</span>
          )}
          {performer.league === 'MyTeam' && (
            <span className="league-badge myteam">🎯 MyTeam</span>
          )}
        </div>
      </div>

      <div className="performance-stats">
        <div className="total-profit">
          <TrendingUp size={16} />
          <div>
            <span className="stat-value">
              {performer.totalProfit >= 0 ? '+' : ''}{performer.totalProfit.toFixed(1)}%
            </span>
            <span className="stat-label">Total Profit</span>
          </div>
        </div>

        <div className="league-breakdown">
          {performer.betLeagueProfit !== 0 && (
            <div className="league-stat">
              <Trophy size={14} />
              <span className="league-profit">
                {performer.betLeagueProfit >= 0 ? '+' : ''}{performer.betLeagueProfit.toFixed(1)}%
              </span>
              <span className="league-name">BetLeague</span>
            </div>
          )}
          {performer.myTeamProfit !== 0 && (
            <div className="league-stat">
              <Target size={14} />
              <span className="league-profit">
                {performer.myTeamProfit >= 0 ? '+' : ''}{performer.myTeamProfit.toFixed(1)}%
              </span>
              <span className="league-name">MyTeam</span>
            </div>
          )}
        </div>
      </div>

      <div className="ranking-info">
        {performer.betLeagueRank && (
          <div className="rank-detail">
            <span className="rank-label">BetLeague Rank:</span>
            <span className="rank-value">#{performer.betLeagueRank}</span>
          </div>
        )}
        {performer.myTeamRank && (
          <div className="rank-detail">
            <span className="rank-label">MyTeam Rank:</span>
            <span className="rank-value">#{performer.myTeamRank}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopPerformerCard;