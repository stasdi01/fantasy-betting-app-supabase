import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, TrendingUp, Trophy, Users, LogOut, Star, Crown, Target, Zap, Award, User, BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useBudget } from "../hooks/useBudget";
import "../components/Loading/LoadingSpinner.css";
import "../styles/Layout.css";

const Layout = ({ children }) => {
  const location = useLocation();
  const { profile, signOut, isPremium } = useAuth();
  const { betLeagueProfit, loading } = useBudget();

  const navItems = [
    { path: "/matches", icon: Home, label: "Matches" },
    { path: "/profit", icon: TrendingUp, label: "Profit" },
    { path: "/myteam", icon: Target, label: "MyTeam" },
    { path: "/public-league", icon: Trophy, label: "Public League" },
    { path: "/your-leagues", icon: Users, label: "Your Leagues" },
    { path: "/leaderboard", icon: Award, label: "Leaderboard" },
    { path: "/vip-team", icon: Crown, label: "VIP Team" },
    { path: "/premium", icon: Zap, label: "Premium" },
    { path: "/profile", icon: User, label: "Profile" },
    { path: "/rules", icon: BookOpen, label: "Rules" },
  ];

  // Display current month BetLeague profit only
  const getProfitDisplay = () => {
    if (loading) {
      return (
        <span className="user-balance">
          <div className="loading-skeleton" style={{ width: '80px', height: '1rem', display: 'inline-block' }}></div>
        </span>
      );
    }

    const currentProfit = Math.round(betLeagueProfit * 100) / 100; // Round to 2 decimal places
    const profitPercent = currentProfit.toFixed(2);
    const isNegative = currentProfit < 0;
    const isBlocked = betLeagueProfit <= -100;

    return (
      <span
        className={`user-balance ${isNegative ? "negative" : "positive"} ${
          isBlocked ? "blocked" : ""
        }`}
        title={`BetLeague Monthly Profit: ${betLeagueProfit.toFixed(2)}%`}
      >
        BetLeague: {isNegative ? "" : "+"}
        {profitPercent}%
      </span>
    );
  };

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <h1>BETIFY</h1>
        </div>
        <div className="header-right">
          {getProfitDisplay()}
          <span className="user-name">
            {profile?.username}
            {isPremium && <Star size={16} className="premium-star" />}
          </span>
          <button onClick={signOut} className="logout-btn">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      <div className="app-body">
        {/* Sidebar Navigation */}
        <nav className="sidebar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? "active" : ""}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Main Content */}
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
