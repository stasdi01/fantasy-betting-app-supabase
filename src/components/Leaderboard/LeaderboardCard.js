import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Trophy,
  Target,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import "../../styles/LeaderboardCard.css";

const LeaderboardCard = ({ player, isCurrentUser = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRankDisplay = (rank) => {
    switch (rank) {
      case 1:
        return { icon: "🥇", class: "gold" };
      case 2:
        return { icon: "🥈", class: "silver" };
      case 3:
        return { icon: "🥉", class: "bronze" };
      default:
        return { icon: null, class: "" };
    }
  };

  const getStreakDisplay = (streak) => {
    if (streak > 0) {
      return <span className="streak positive">🔥 {streak} Win Streak</span>;
    } else if (streak < 0) {
      return (
        <span className="streak negative">
          ❄️ {Math.abs(streak)} Loss Streak
        </span>
      );
    }
    return null;
  };

  const rankDisplay = getRankDisplay(player.rank);

  return (
    <div
      className={`leaderboard-card ${rankDisplay.class} ${
        isCurrentUser ? "current-user" : ""
      }`}
    >
      <div className="card-main" onClick={() => setIsExpanded(!isExpanded)}>
        {/* Rank */}
        <div className="rank-section">
          <div className="rank-number">#{player.rank}</div>
          {rankDisplay.icon && (
            <div className="rank-medal">{rankDisplay.icon}</div>
          )}
        </div>

        {/* Player Info */}
        <div className="player-section">
          <div className="player-info">
            <span className="player-avatar">{player.avatar}</span>
            <span className="player-name">{player.username}</span>
            <span className="player-country">{player.country}</span>
          </div>
          {getStreakDisplay(player.streak)}
        </div>

        {/* Stats */}
        <div className="stats-section">
          <div className="stat-item">
            <span className="stat-label">Profit</span>
            <span
              className={`stat-value ${
                player.totalProfit >= 0 ? "positive" : "negative"
              }`}
            >
              {player.totalProfit >= 0 ? "+" : ""}
              {player.totalProfit.toFixed(2)}%
            </span>
          </div>

          <div className="stat-item">
            <span className="stat-label">Win Rate</span>
            <div className="winrate-display">
              <div className="winrate-bar">
                <div
                  className="winrate-fill"
                  style={{ width: `${player.winRate}%` }}
                ></div>
              </div>
              <span className="winrate-text">{player.winRate}%</span>
            </div>
          </div>

          <div className="stat-item">
            <span className="stat-label">Bets</span>
            <span className="stat-value">{player.totalBets}</span>
          </div>
        </div>

        {/* Expand Button */}
        <button className="expand-button">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="card-details">
          <div className="details-grid">
            <div className="detail-item">
              <Trophy size={16} />
              <span className="detail-label">Best Win</span>
              <span className="detail-value positive">+{player.bestWin}%</span>
            </div>

            <div className="detail-item">
              <Target size={16} />
              <span className="detail-label">Won/Lost</span>
              <span className="detail-value">
                {player.wonBets}/{player.lostBets}
              </span>
            </div>

            <div className="detail-item">
              <TrendingUp size={16} />
              <span className="detail-label">Today</span>
              <span
                className={`detail-value ${
                  player.todayProfit >= 0 ? "positive" : "negative"
                }`}
              >
                {player.todayProfit >= 0 ? "+" : ""}
                {player.todayProfit.toFixed(2)}%
              </span>
            </div>

            <div className="detail-item">
              <TrendingUp size={16} />
              <span className="detail-label">This Week</span>
              <span
                className={`detail-value ${
                  player.weeklyProfit >= 0 ? "positive" : "negative"
                }`}
              >
                {player.weeklyProfit >= 0 ? "+" : ""}
                {player.weeklyProfit.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardCard;
