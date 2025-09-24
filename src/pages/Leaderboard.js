import React, { useState, useEffect } from "react";
import { Trophy, TrendingUp, Target, Users, Medal } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useBudget } from "../hooks/useBudget";
import SkeletonCard from "../components/Loading/SkeletonCard";
import "../styles/Leaderboard.css";

const Leaderboard = () => {
  const { profile } = useAuth();
  const { freeProfit } = useBudget();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState("all");

  // Mock data for demonstration - in real app this would come from API
  const mockLeaderboardData = [
    { id: 1, username: "ProBetter", profit: 245.7, bets: 128, winRate: 68.5, avatar: "🏆" },
    { id: 2, username: "LuckyStrike", profit: 189.3, bets: 94, winRate: 61.2, avatar: "🎯" },
    { id: 3, username: "BetMaster", profit: 156.8, bets: 156, winRate: 55.8, avatar: "💎" },
    { id: 4, username: "RiskTaker", profit: 134.2, bets: 87, winRate: 64.4, avatar: "⚡" },
    { id: 5, username: "GoldRush", profit: 128.9, bets: 203, winRate: 52.2, avatar: "🔥" },
    { id: 6, username: "ChampionBet", profit: 97.6, bets: 76, winRate: 71.1, avatar: "👑" },
    { id: 7, username: "WinStreak", profit: 89.4, bets: 112, winRate: 58.9, avatar: "💪" },
    { id: 8, username: "BigWinner", profit: 76.3, bets: 145, winRate: 49.7, avatar: "🎲" },
  ];

  useEffect(() => {
    // Simulate loading delay
    const loadLeaderboard = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLeaderboard(mockLeaderboardData);
      setLoading(false);
    };

    loadLeaderboard();
  }, [filterPeriod]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `#${rank}`;
    }
  };

  const getProfitColor = (profit) => {
    return profit >= 0 ? "var(--success)" : "var(--danger)";
  };

  const getCurrentUserRank = () => {
    // Find where current user would rank based on their profit
    const userProfit = freeProfit;
    let rank = 1;
    for (const player of leaderboard) {
      if (userProfit >= player.profit) break;
      rank++;
    }
    return rank;
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
              <h1>Leaderboard</h1>
              <p>Compete with the best bettors worldwide</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="stat-item">
              <Users size={20} />
              <div>
                <span className="stat-value">1,234</span>
                <span className="stat-label">Players</span>
              </div>
            </div>
            <div className="stat-item">
              <Target size={20} />
              <div>
                <span className="stat-value">58.3%</span>
                <span className="stat-label">Avg Win Rate</span>
              </div>
            </div>
            <div className="stat-item">
              <Medal size={20} />
              <div>
                <span className="stat-value">#{getCurrentUserRank()}</span>
                <span className="stat-label">Your Rank</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {[
          { key: "all", label: "All Time" },
          { key: "month", label: "This Month" },
          { key: "week", label: "This Week" },
          { key: "today", label: "Today" }
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`tab-button ${filterPeriod === key ? "active" : ""}`}
            onClick={() => setFilterPeriod(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Leaderboard List */}
      <div className="leaderboard-content">
        <div className="section-title">
          <TrendingUp size={24} />
          <h2>Top Performers</h2>
          <span className="period-badge">{
            filterPeriod === "all" ? "All Time" :
            filterPeriod === "month" ? "Monthly" :
            filterPeriod === "week" ? "Weekly" : "Daily"
          }</span>
        </div>

        {loading ? (
          <div className="leaderboard-list">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonCard key={index} type="leaderboard" />
            ))}
          </div>
        ) : (
          <>
            <div className="leaderboard-list">
              {leaderboard.map((player, index) => (
                <div key={player.id} className={`leaderboard-card ${index < 3 ? "top-three" : ""}`}>
                  <div className="rank-section">
                    <span className="rank">{getRankIcon(index + 1)}</span>
                    {index < 3 && <div className="rank-glow"></div>}
                  </div>

                  <div className="player-info">
                    <div className="avatar">{player.avatar}</div>
                    <div className="player-details">
                      <h3 className="username">{player.username}</h3>
                      <div className="stats-row">
                        <span className="bet-count">{player.bets} bets</span>
                        <span className="win-rate">{player.winRate}% win rate</span>
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

            {/* Current User Card */}
            {profile && (
              <div className="current-user-section">
                <div className="separator">
                  <span>Your Position</span>
                </div>
                <div className="leaderboard-card current-user">
                  <div className="rank-section">
                    <span className="rank">#{getCurrentUserRank()}</span>
                  </div>

                  <div className="player-info">
                    <div className="avatar">👤</div>
                    <div className="player-details">
                      <h3 className="username">{profile.username}</h3>
                      <div className="stats-row">
                        <span className="bet-count">-- bets</span>
                        <span className="win-rate">-- win rate</span>
                      </div>
                    </div>
                  </div>

                  <div className="profit-section">
                    <span
                      className="profit-value"
                      style={{ color: getProfitColor(freeProfit) }}
                    >
                      {freeProfit >= 0 ? "+" : ""}{freeProfit.toFixed(1)}%
                    </span>
                    <span className="profit-label">Profit</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;