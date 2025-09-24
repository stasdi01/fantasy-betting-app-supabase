import React, { useState } from "react";
import { Trophy, TrendingUp, Target, Users, Medal, Crown, Award, Calendar } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useFreeLeague } from "../hooks/useFreeLeague";
import SkeletonCard from "../components/Loading/SkeletonCard";
import "../styles/Leaderboard.css";

const Leaderboard = () => {
  const { profile } = useAuth();
  const {
    userLeagueData,
    userRankConfig,
    userPositionInRank,
    userOverallPosition,
    leagueStats,
    currentMonthLeaderboard,
    monthlyWinners,
    statusMessage,
    currentMonth,
    loading
  } = useFreeLeague();
  const [filterPeriod, setFilterPeriod] = useState("all");


  const getProfitColor = (profit) => {
    return profit >= 0 ? "var(--success)" : "var(--danger)";
  };


  return (
    <div className="leaderboard-container">
      {/* Modern Header */}
      <div className="modern-header">
        <div className="header-background">
          <div className="gradient-circle circle-1"></div>
          <div className="gradient-circle circle-2"></div>
          <div className="gradient-circle circle-3"></div>
        </div>

        <div className="header-content">
          <div className="title-section">
            <div className="icon-wrapper">
              <Trophy size={40} className="main-icon" />
            </div>
            <div className="title-text">
              <h1>Free League</h1>
              <p>Compete with the best bettors worldwide</p>
            </div>
          </div>

          {/* User League Status */}
          <div className="user-league-status">
            <div className="rank-display">
              <div className="rank-icon" style={{ background: userRankConfig.gradient }}>
                <span className="rank-emoji">{userRankConfig.icon}</span>
              </div>
              <div className="rank-info">
                <h3 className="rank-title">{userRankConfig.name} League</h3>
                <p className="rank-position">Position #{userPositionInRank} in rank</p>
                <p className="overall-position">#{userOverallPosition} overall</p>
              </div>
            </div>
            <div className="status-message" style={{ borderColor: `var(--${statusMessage.color})` }}>
              <p style={{ color: `var(--${statusMessage.color})` }}>{statusMessage.message}</p>
            </div>
          </div>

          {/* League Stats */}
          <div className="league-stats-grid">
            <div className="stat-item">
              <Users size={20} />
              <div>
                <span className="stat-value">{leagueStats.total.toLocaleString()}</span>
                <span className="stat-label">Total Players</span>
              </div>
            </div>
            <div className="stat-item">
              <Target size={20} />
              <div>
                <span className="stat-value">{userLeagueData.winRate.toFixed(1)}%</span>
                <span className="stat-label">Your Win Rate</span>
              </div>
            </div>
            <div className="stat-item">
              <Medal size={20} />
              <div>
                <span className="stat-value">{userLeagueData.bets}</span>
                <span className="stat-label">Your Bets</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* League Ranks Overview */}
      <div className="league-ranks-overview">
        <h2 className="section-subtitle">Free League Ranks</h2>
        <div className="ranks-grid">
          {[
            { rank: 'bronze', name: 'Bronze', icon: '🥉', count: leagueStats.bronze },
            { rank: 'silver', name: 'Silver', icon: '🥈', count: leagueStats.silver },
            { rank: 'gold', name: 'Gold', icon: '🥇', count: leagueStats.gold },
            { rank: 'platinum', name: 'Platinum', icon: '💎', count: leagueStats.platinum },
            { rank: 'diamond', name: 'Diamond', icon: '💍', count: leagueStats.diamond }
          ].map(({ rank, name, icon, count }) => (
            <div key={rank} className={`rank-card ${userLeagueData.currentRank === rank ? 'current-rank' : ''}`}>
              <div className="rank-icon-small">{icon}</div>
              <h4 className="rank-name">{name}</h4>
              <p className="rank-count">{count.toLocaleString()} players</p>
              {userLeagueData.currentRank === rank && <span className="current-badge">You are here</span>}
              {userLeagueData.currentRank === rank && (
                <div className="rank-position-info">
                  <span className="position-text">Position #{userPositionInRank}</span>
                  <span className="promotion-text">
                    {userPositionInRank <= 3 ? 'Promotion Zone! 🔥' :
                     userPositionInRank > count - 3 && rank !== 'bronze' ? 'Danger Zone ⚠️' :
                     `${4 - userPositionInRank > 0 ? 4 - userPositionInRank : 0} spots to Top 3`}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="leaderboard-content">
        <div className="section-title">
          <TrendingUp size={24} />
          <h2>Top Players - {currentMonth}</h2>
          <span className="period-badge">Monthly Leaderboard</span>
        </div>

        {loading ? (
          <div className="leaderboard-list">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonCard key={index} type="leaderboard" />
            ))}
          </div>
        ) : (
          <>
            <div className="leaderboard-by-ranks">
              {[
                { rank: 'diamond', name: 'Diamond', icon: '💍', color: '#b9f2ff' },
                { rank: 'platinum', name: 'Platinum', icon: '💎', color: '#e5e4e2' },
                { rank: 'gold', name: 'Gold', icon: '🥇', color: '#ffd700' },
                { rank: 'silver', name: 'Silver', icon: '🥈', color: '#c0c0c0' },
                { rank: 'bronze', name: 'Bronze', icon: '🥉', color: '#cd7f32' }
              ].map(({ rank, name, icon, color }) => {
                const rankPlayers = currentMonthLeaderboard.filter(player => player.rank === rank);

                if (rankPlayers.length === 0) return null;

                return (
                  <div key={rank} className="rank-leaderboard-section">
                    <div className="rank-section-header" style={{ borderColor: color }}>
                      <div className="rank-title-wrapper">
                        <span className="rank-icon-header">{icon}</span>
                        <h3 className="rank-title">{name} League</h3>
                        <span className="rank-count">{leagueStats[rank]} players</span>
                      </div>
                    </div>

                    <div className="rank-players">
                      {rankPlayers.map((player) => (
                        <div key={player.id} className={`leaderboard-card rank-card-${rank} ${player.isCurrentUser ? "current-user" : ""}`}>
                          <div className="rank-section">
                            <span className="rank-position">#{player.rankPosition}</span>
                          </div>

                          <div className="player-info">
                            <div className="avatar">{player.avatar}</div>
                            <div className="player-details">
                              <h3 className="username">
                                {player.username}
                                {player.isCurrentUser && <span className="you-badge">You</span>}
                              </h3>
                              <div className="stats-row">
                                <span className="bet-count">{player.bets} bets</span>
                                <span className="win-rate">{player.winRate.toFixed(1)}% win rate</span>
                              </div>
                            </div>
                          </div>

                          <div className="profit-section">
                            <span
                              className="profit-value"
                              style={{ color: getProfitColor(player.profit) }}
                            >
                              {player.profit >= 0 ? "+" : ""}{player.profit.toFixed(1)}%
                            </span>
                            <span className="profit-label">Profit</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Monthly Winners History */}
            <div className="monthly-winners-section">
              <div className="winners-header">
                <Crown size={24} />
                <h3>Diamond Rank Winners</h3>
              </div>
              <div className="winners-grid">
                {monthlyWinners.slice(0, 6).map(({ monthKey, monthName, year, winner }) => (
                  <div key={monthKey} className="winner-card">
                    <div className="winner-month">
                      <Calendar size={16} />
                      <span>{monthName} {year}</span>
                    </div>
                    <div className="winner-name">
                      <Award size={16} />
                      <span>{winner}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;