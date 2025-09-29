import React, { useState } from 'react';
import { Trophy, TrendingUp, Target, Users, Medal, Crown, Award, Calendar, Gamepad2 } from 'lucide-react';
import { useAuth } from "../context/AuthContext";
import { useFreeLeague } from "../hooks/useFreeLeague";
import SkeletonCard from "../components/Loading/SkeletonCard";
import "../styles/Leaderboard.css";

const PublicLeague = () => {
  const [activeTab, setActiveTab] = useState('betleague');

  return (
    <div className="public-league-container">
      {/* Header */}
      <div className="public-league-header">
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
              <h1>Public League</h1>
              <p>Compete in free leagues that all users automatically join</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="league-nav">
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'betleague' ? 'active' : ''}`}
            onClick={() => setActiveTab('betleague')}
          >
            <Target size={20} />
            <span>BetLeague</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'myteam' ? 'active' : ''}`}
            onClick={() => setActiveTab('myteam')}
          >
            <Gamepad2 size={20} />
            <span>MyTeam League</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="league-content">
        {activeTab === 'betleague' ? (
          <BetLeagueSection />
        ) : (
          <MyTeamLeagueSection />
        )}
      </div>
    </div>
  );
};

// BetLeague Section (moved from Leaderboard)
const BetLeagueSection = () => {
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

  const getProfitColor = (profit) => {
    return profit >= 0 ? "var(--success)" : "var(--danger)";
  };

  return (
    <div className="betleague-section">
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

      {/* League Ranks Overview */}
      <div className="league-ranks-overview">
        <h2 className="section-subtitle">BetLeague Ranks</h2>
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

// MyTeam League Section
const MyTeamLeagueSection = () => {
  // Mock data for MyTeam League
  const myTeamUserData = {
    currentRank: 'gold',
    winRate: 68.4,
    predictions: 147,
    currentPoints: 2834
  };

  const myTeamUserRankConfig = {
    name: 'Gold',
    icon: '🥇',
    gradient: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)'
  };

  const myTeamUserPositionInRank = 8;
  const myTeamUserOverallPosition = 156;

  const myTeamLeagueStats = {
    total: 8945,
    bronze: 4523,
    silver: 2687,
    gold: 1234,
    platinum: 387,
    diamond: 114
  };

  const myTeamStatusMessage = {
    message: "Great performance! You're in the top 25% of Gold rank players. 3 more spots to reach Top 5!",
    color: "success"
  };

  const currentSeason = "EuroLeague 2024-25";

  const myTeamCurrentLeaderboard = [
    // Diamond
    { id: 1, username: "FantasyKing", avatar: "👑", rank: "diamond", rankPosition: 1, predictions: 203, winRate: 89.2, profit: 156.8, isCurrentUser: false },
    { id: 2, username: "EuroMaster", avatar: "🎯", rank: "diamond", rankPosition: 2, predictions: 198, winRate: 86.4, profit: 142.3, isCurrentUser: false },
    { id: 3, username: "TeamBuilder", avatar: "🏆", rank: "diamond", rankPosition: 3, predictions: 195, winRate: 84.1, profit: 138.9, isCurrentUser: false },

    // Platinum
    { id: 4, username: "PlayerPro", avatar: "💎", rank: "platinum", rankPosition: 1, predictions: 182, winRate: 78.9, profit: 89.6, isCurrentUser: false },
    { id: 5, username: "StatGuru", avatar: "📊", rank: "platinum", rankPosition: 2, predictions: 175, winRate: 76.2, profit: 84.7, isCurrentUser: false },
    { id: 6, username: "CoachMike", avatar: "🏀", rank: "platinum", rankPosition: 3, predictions: 169, winRate: 74.8, profit: 78.3, isCurrentUser: false },

    // Gold
    { id: 7, username: "BasketFan", avatar: "⭐", rank: "gold", rankPosition: 1, predictions: 156, winRate: 71.2, profit: 67.4, isCurrentUser: false },
    { id: 8, username: "YourUsername", avatar: "🚀", rank: "gold", rankPosition: 8, predictions: 147, winRate: 68.4, profit: 58.2, isCurrentUser: true },
    { id: 9, username: "ScoutExpert", avatar: "🔥", rank: "gold", rankPosition: 12, predictions: 143, winRate: 66.9, profit: 52.1, isCurrentUser: false },

    // Silver
    { id: 10, username: "Rookie23", avatar: "🌟", rank: "silver", rankPosition: 1, predictions: 134, winRate: 62.7, profit: 34.8, isCurrentUser: false },
    { id: 11, username: "PlayerOne", avatar: "🎮", rank: "silver", rankPosition: 2, predictions: 128, winRate: 61.3, profit: 31.2, isCurrentUser: false },

    // Bronze
    { id: 12, username: "Beginner", avatar: "🏃", rank: "bronze", rankPosition: 1, predictions: 89, winRate: 52.8, profit: 12.4, isCurrentUser: false },
    { id: 13, username: "Learning", avatar: "📚", rank: "bronze", rankPosition: 2, predictions: 76, winRate: 48.7, profit: 8.9, isCurrentUser: false }
  ];

  const myTeamSeasonWinners = [
    { seasonKey: "2023-24", seasonName: "2023-24", winner: "FantasyLegend" },
    { seasonKey: "2022-23", seasonName: "2022-23", winner: "EuroChampion" },
    { seasonKey: "2021-22", seasonName: "2021-22", winner: "TeamMaster" },
    { seasonKey: "2020-21", seasonName: "2020-21", winner: "PlayerKing" },
    { seasonKey: "2019-20", seasonName: "2019-20", winner: "StatWizard" },
    { seasonKey: "2018-19", seasonName: "2018-19", winner: "CoachPro" }
  ];

  const getProfitColor = (profit) => {
    return profit >= 0 ? "var(--success)" : "var(--danger)";
  };

  return (
    <div className="betleague-section">
      {/* User League Status */}
      <div className="user-league-status">
        <div className="rank-display">
          <div className="rank-icon" style={{ background: myTeamUserRankConfig.gradient }}>
            <span className="rank-emoji">{myTeamUserRankConfig.icon}</span>
          </div>
          <div className="rank-info">
            <h3 className="rank-title">{myTeamUserRankConfig.name} League</h3>
            <p className="rank-position">Position #{myTeamUserPositionInRank} in rank</p>
            <p className="overall-position">#{myTeamUserOverallPosition} overall</p>
          </div>
        </div>
        <div className="status-message" style={{ borderColor: `var(--${myTeamStatusMessage.color})` }}>
          <p style={{ color: `var(--${myTeamStatusMessage.color})` }}>{myTeamStatusMessage.message}</p>
        </div>
      </div>

      {/* League Stats */}
      <div className="league-stats-grid">
        <div className="stat-item">
          <Users size={20} />
          <div>
            <span className="stat-value">{myTeamLeagueStats.total.toLocaleString()}</span>
            <span className="stat-label">Total Players</span>
          </div>
        </div>
        <div className="stat-item">
          <Target size={20} />
          <div>
            <span className="stat-value">{myTeamUserData.winRate.toFixed(1)}%</span>
            <span className="stat-label">Your Win Rate</span>
          </div>
        </div>
        <div className="stat-item">
          <Medal size={20} />
          <div>
            <span className="stat-value">{myTeamUserData.predictions}</span>
            <span className="stat-label">Your Predictions</span>
          </div>
        </div>
      </div>

      {/* League Ranks Overview */}
      <div className="league-ranks-overview">
        <h2 className="section-subtitle">MyTeam League Ranks</h2>
        <div className="ranks-grid">
          {[
            { rank: 'bronze', name: 'Bronze', icon: '🥉', count: myTeamLeagueStats.bronze },
            { rank: 'silver', name: 'Silver', icon: '🥈', count: myTeamLeagueStats.silver },
            { rank: 'gold', name: 'Gold', icon: '🥇', count: myTeamLeagueStats.gold },
            { rank: 'platinum', name: 'Platinum', icon: '💎', count: myTeamLeagueStats.platinum },
            { rank: 'diamond', name: 'Diamond', icon: '💍', count: myTeamLeagueStats.diamond }
          ].map(({ rank, name, icon, count }) => (
            <div key={rank} className={`rank-card ${myTeamUserData.currentRank === rank ? 'current-rank' : ''}`}>
              <div className="rank-icon-small">{icon}</div>
              <h4 className="rank-name">{name}</h4>
              <p className="rank-count">{count.toLocaleString()} players</p>
              {myTeamUserData.currentRank === rank && <span className="current-badge">You are here</span>}
              {myTeamUserData.currentRank === rank && (
                <div className="rank-position-info">
                  <span className="position-text">Position #{myTeamUserPositionInRank}</span>
                  <span className="promotion-text">
                    {myTeamUserPositionInRank <= 3 ? 'Promotion Zone! 🔥' :
                     myTeamUserPositionInRank > count - 3 && rank !== 'bronze' ? 'Danger Zone ⚠️' :
                     `${4 - myTeamUserPositionInRank > 0 ? 4 - myTeamUserPositionInRank : 0} spots to Top 3`}
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
          <h2>Top Players - {currentSeason}</h2>
          <span className="period-badge">Season Leaderboard</span>
        </div>

        <div className="leaderboard-by-ranks">
          {[
            { rank: 'diamond', name: 'Diamond', icon: '💍', color: '#b9f2ff' },
            { rank: 'platinum', name: 'Platinum', icon: '💎', color: '#e5e4e2' },
            { rank: 'gold', name: 'Gold', icon: '🥇', color: '#ffd700' },
            { rank: 'silver', name: 'Silver', icon: '🥈', color: '#c0c0c0' },
            { rank: 'bronze', name: 'Bronze', icon: '🥉', color: '#cd7f32' }
          ].map(({ rank, name, icon, color }) => {
            const rankPlayers = myTeamCurrentLeaderboard.filter(player => player.rank === rank);

            if (rankPlayers.length === 0) return null;

            return (
              <div key={rank} className="rank-leaderboard-section">
                <div className="rank-section-header" style={{ borderColor: color }}>
                  <div className="rank-title-wrapper">
                    <span className="rank-icon-header">{icon}</span>
                    <h3 className="rank-title">{name} League</h3>
                    <span className="rank-count">{myTeamLeagueStats[rank]} players</span>
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
                            <span className="bet-count">{player.predictions} predictions</span>
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
                        <span className="profit-label">Points</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Season Winners History */}
        <div className="monthly-winners-section">
          <div className="winners-header">
            <Crown size={24} />
            <h3>Diamond Rank Champions</h3>
          </div>
          <div className="winners-grid">
            {myTeamSeasonWinners.slice(0, 6).map(({ seasonKey, seasonName, winner }) => (
              <div key={seasonKey} className="winner-card">
                <div className="winner-month">
                  <Calendar size={16} />
                  <span>{seasonName} Season</span>
                </div>
                <div className="winner-name">
                  <Award size={16} />
                  <span>{winner}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicLeague;