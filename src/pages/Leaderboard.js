import React, { useState, useEffect } from "react";
import { Trophy, TrendingUp, Medal, Crown } from "lucide-react";
import LeaderboardCard from "../components/Leaderboard/LeaderboardCard";
import {
  globalLeaderboardData,
  currentUserStats,
} from "../data/leaderboardData";
import "../styles/Leaderboard.css";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState("all"); // all, today, week, month
  const [showCurrentUser] = useState(true);

  useEffect(() => {
    // Sortiraj po odgovarajućem periodu
    let sortedData = [...globalLeaderboardData];

    switch (filterPeriod) {
      case "today":
        sortedData.sort((a, b) => b.todayProfit - a.todayProfit);
        break;
      case "week":
        sortedData.sort((a, b) => b.weeklyProfit - a.weeklyProfit);
        break;
      case "month":
        sortedData.sort((a, b) => b.monthlyProfit - a.monthlyProfit);
        break;
      default:
        sortedData.sort((a, b) => b.totalProfit - a.totalProfit);
    }

    // Ažuriraj rankove nakon sortiranja
    sortedData = sortedData.map((player, index) => ({
      ...player,
      rank: index + 1,
    }));

    setLeaderboard(sortedData);
  }, [filterPeriod]);

  return (
    <div className="leaderboard-container">
      {/* Header */}
      <div className="leaderboard-header">
        <div className="header-content">
          <div className="header-title">
            <Crown size={32} className="crown-icon" />
            <div className="header-text"></div>
            <h1>Global Leaderboard</h1>
            <p>Compete with the best players worldwide</p>
          </div>
        </div>

        <div className="stats-and-filters">
          {/* Stats Cards */}
          <div className="stats-cards">
            <div className="stat-card">
              <Trophy size={24} />
              <div className="stat-info">
                <span className="stat-label">Total Players</span>
                <span className="stat-value">1,234</span>
              </div>
            </div>
            <div className="stat-card">
              <TrendingUp size={24} />
              <div className="stat-info">
                <span className="stat-label">Avg. Win Rate</span>
                <span className="stat-value">58.3%</span>
              </div>
            </div>
            <div className="stat-card">
              <Medal size={24} />
              <div className="stat-info">
                <span className="stat-label">Your Rank</span>
                <span className="stat-value">#{currentUserStats.rank}</span>
              </div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="filter-section">
            <button
              className={`filter-btn ${filterPeriod === "all" ? "active" : ""}`}
              onClick={() => setFilterPeriod("all")}
            >
              All Time
            </button>
            <button
              className={`filter-btn ${
                filterPeriod === "month" ? "active" : ""
              }`}
              onClick={() => setFilterPeriod("month")}
            >
              This Month
            </button>
            <button
              className={`filter-btn ${
                filterPeriod === "week" ? "active" : ""
              }`}
              onClick={() => setFilterPeriod("week")}
            >
              This Week
            </button>
            <button
              className={`filter-btn ${
                filterPeriod === "today" ? "active" : ""
              }`}
              onClick={() => setFilterPeriod("today")}
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="leaderboard-list">
        <div className="list-header">
          <h2>Top 10 Players</h2>
          <span className="period-badge">
            {filterPeriod === "all"
              ? "All Time"
              : filterPeriod === "month"
              ? "Monthly"
              : filterPeriod === "week"
              ? "Weekly"
              : "Daily"}
          </span>
        </div>

        {leaderboard.slice(0, 10).map((player) => (
          <LeaderboardCard
            key={player.id}
            player={player}
            isCurrentUser={false}
          />
        ))}

        {/* Current User Position */}
        {showCurrentUser && currentUserStats.rank > 10 && (
          <div className="current-user-section">
            <div className="dots-separator">• • •</div>
            <LeaderboardCard player={currentUserStats} isCurrentUser={true} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
