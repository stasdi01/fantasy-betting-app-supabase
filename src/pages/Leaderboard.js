import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Medal, Target, TrendingUp, Calendar, Award, Star, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/Loading/LoadingSpinner';
import '../styles/Leaderboard.css';

// Mock data for top 10 all-time players
const allTimeLeaderboardData = [
  {
    id: 1,
    username: "BetKing2024",
    avatar: "👑",
    totalProfit: 2847.6,
    totalBets: 1250,
    winRate: 68.4,
    bestStreak: 23,
    joinDate: "2023-01-15",
    badge: "legend",
    specialTitle: "Betting Legend"
  },
  {
    id: 2,
    username: "OddsMaster",
    avatar: "🔥",
    totalProfit: 2156.3,
    totalBets: 980,
    winRate: 72.1,
    bestStreak: 19,
    joinDate: "2023-03-22",
    badge: "master",
    specialTitle: "Prediction Master"
  },
  {
    id: 3,
    username: "GoldenBetter",
    avatar: "⚡",
    totalProfit: 1923.8,
    totalBets: 875,
    winRate: 69.7,
    bestStreak: 16,
    joinDate: "2023-02-08",
    badge: "elite",
    specialTitle: "Elite Predictor"
  },
  {
    id: 4,
    username: "SportsSage",
    avatar: "🎯",
    totalProfit: 1567.2,
    totalBets: 720,
    winRate: 71.3,
    bestStreak: 15,
    joinDate: "2023-04-12",
    badge: "expert",
    specialTitle: "Sports Expert"
  },
  {
    id: 5,
    username: "PredictionPro",
    avatar: "💎",
    totalProfit: 1342.9,
    totalBets: 650,
    winRate: 67.8,
    bestStreak: 18,
    joinDate: "2023-05-30",
    badge: "pro",
    specialTitle: "Pro Analyst"
  },
  {
    id: 6,
    username: "LuckyStrike",
    avatar: "🌟",
    totalProfit: 1187.5,
    totalBets: 590,
    winRate: 66.2,
    bestStreak: 12,
    joinDate: "2023-06-18",
    badge: "skilled",
    specialTitle: "Lucky Striker"
  },
  {
    id: 7,
    username: "WinStreak",
    avatar: "🏆",
    totalProfit: 1045.7,
    totalBets: 520,
    winRate: 70.4,
    bestStreak: 21,
    joinDate: "2023-07-03",
    badge: "skilled",
    specialTitle: "Streak Master"
  },
  {
    id: 8,
    username: "BetGenius",
    avatar: "🧠",
    totalProfit: 892.4,
    totalBets: 480,
    winRate: 68.9,
    bestStreak: 14,
    joinDate: "2023-08-15",
    badge: "talented",
    specialTitle: "Betting Genius"
  },
  {
    id: 9,
    username: "ChampPlayer",
    avatar: "🥇",
    totalProfit: 764.3,
    totalBets: 420,
    winRate: 65.7,
    bestStreak: 11,
    joinDate: "2023-09-22",
    badge: "talented",
    specialTitle: "Champion"
  },
  {
    id: 10,
    username: "TopShooter",
    avatar: "🎰",
    totalProfit: 643.8,
    totalBets: 380,
    winRate: 64.2,
    bestStreak: 10,
    joinDate: "2023-10-08",
    badge: "rising",
    specialTitle: "Rising Star"
  }
];

const getBadgeColor = (badge) => {
  const colors = {
    legend: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
    master: 'linear-gradient(135deg, #a55eea, #8854d0)',
    elite: 'linear-gradient(135deg, #26de81, #20bf6b)',
    expert: 'linear-gradient(135deg, #fed330, #f7b731)',
    pro: 'linear-gradient(135deg, #45aaf2, #2d98da)',
    skilled: 'linear-gradient(135deg, #fd79a8, #e84393)',
    talented: 'linear-gradient(135deg, #fdcb6e, #e17055)',
    rising: 'linear-gradient(135deg, #6c5ce7, #a29bfe)'
  };
  return colors[badge] || 'linear-gradient(135deg, var(--primary), var(--primary-light))';
};

const Leaderboard = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    // Simulate loading delay
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Add current user indicator
      const dataWithUserFlag = allTimeLeaderboardData.map(player => ({
        ...player,
        isCurrentUser: profile?.username === player.username
      }));

      setLeaderboardData(dataWithUserFlag);
      setLoading(false);
    };

    loadData();
  }, [profile]);

  const getProfitColor = (profit) => {
    return profit >= 0 ? "var(--success)" : "var(--danger)";
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="leaderboard-container">
      {/* Header */}
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
              <h1>All-Time Leaderboard</h1>
              <p>Hall of Fame - Top 10 greatest bettors of all time</p>
            </div>
          </div>

          <div className="stats-showcase">
            <div className="showcase-stat">
              <Crown size={24} />
              <div>
                <span className="stat-value">Top 10</span>
                <span className="stat-label">Elite Players</span>
              </div>
            </div>
            <div className="showcase-stat">
              <TrendingUp size={24} />
              <div>
                <span className="stat-value">{leaderboardData[0]?.totalProfit.toFixed(1)}%</span>
                <span className="stat-label">Highest Profit</span>
              </div>
            </div>
            <div className="showcase-stat">
              <Target size={24} />
              <div>
                <span className="stat-value">{leaderboardData[1]?.winRate.toFixed(1)}%</span>
                <span className="stat-label">Best Win Rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Content */}
      <div className="leaderboard-content">
        <div className="section-title">
          <Medal size={24} />
          <h2>Hall of Fame</h2>
          <span className="period-badge">All-Time Rankings</span>
        </div>

        {loading ? (
          <div className="loading-container">
            <LoadingSpinner size="lg" />
            <p>Loading Hall of Fame...</p>
          </div>
        ) : (
          <div className="all-time-leaderboard">
            {/* Top 3 Podium */}
            <div className="podium-section">
              <h3 className="podium-title">
                <Star size={20} />
                Top 3 Champions
              </h3>
              <div className="podium">
                {leaderboardData.slice(0, 3).map((player, index) => (
                  <div key={player.id} className={`podium-player position-${index + 1} ${player.isCurrentUser ? 'current-user' : ''}`}>
                    <div className="podium-rank">
                      {index === 0 && <Crown size={24} className="crown" />}
                      {index === 1 && <Medal size={24} className="silver" />}
                      {index === 2 && <Award size={24} className="bronze" />}
                    </div>
                    <div className="podium-avatar">{player.avatar}</div>
                    <div className="podium-info">
                      <h4 className="podium-username">
                        {player.username}
                        {player.isCurrentUser && <span className="you-badge">You</span>}
                      </h4>
                      <div className="podium-badge" style={{ background: getBadgeColor(player.badge) }}>
                        {player.specialTitle}
                      </div>
                      <div className="podium-profit" style={{ color: getProfitColor(player.totalProfit) }}>
                        +{player.totalProfit.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Full Rankings */}
            <div className="full-rankings">
              <h3 className="rankings-title">
                <TrendingUp size={20} />
                Complete Rankings
              </h3>
              <div className="rankings-list">
                {leaderboardData.map((player, index) => (
                  <div key={player.id} className={`ranking-card ${player.isCurrentUser ? 'current-user' : ''} ${index < 3 ? 'top-three' : ''}`}>
                    <div className="rank-position">
                      <span className="rank-number">#{index + 1}</span>
                      {index < 3 && (
                        <div className="rank-medal">
                          {index === 0 && <Crown size={16} />}
                          {index === 1 && <Medal size={16} />}
                          {index === 2 && <Award size={16} />}
                        </div>
                      )}
                    </div>

                    <div className="player-main-info">
                      <div className="player-avatar-section">
                        <div className="avatar-large">{player.avatar}</div>
                        <div className="player-details">
                          <h4 className="player-username">
                            {player.username}
                            {player.isCurrentUser && <span className="you-badge">You</span>}
                          </h4>
                          <div className="player-badge" style={{ background: getBadgeColor(player.badge) }}>
                            {player.specialTitle}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="player-stats">
                      <div className="stat-group">
                        <div className="stat-item">
                          <span className="stat-label">Total Profit</span>
                          <span className="stat-value profit" style={{ color: getProfitColor(player.totalProfit) }}>
                            +{player.totalProfit.toFixed(1)}%
                          </span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Win Rate</span>
                          <span className="stat-value">{player.winRate.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="stat-group">
                        <div className="stat-item">
                          <span className="stat-label">Total Bets</span>
                          <span className="stat-value">{player.totalBets.toLocaleString()}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Best Streak</span>
                          <span className="stat-value">
                            {player.bestStreak}
                            <Flame size={14} className="streak-icon" />
                          </span>
                        </div>
                      </div>
                      <div className="stat-group">
                        <div className="stat-item">
                          <span className="stat-label">Member Since</span>
                          <span className="stat-value">
                            <Calendar size={14} />
                            {formatDate(player.joinDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;