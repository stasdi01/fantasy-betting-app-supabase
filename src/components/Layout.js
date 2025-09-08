import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, TrendingUp, Trophy, Users, LogOut } from "lucide-react";
import { calculateBalance } from "../utils/budgetUtils";
import "../styles/Layout.css";

const Layout = ({ children, currentUser, onLogout }) => {
  const location = useLocation();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    // Ažuriraj balans kada se promeni stranica
    const updateBalance = () => {
      const currentBalance = calculateBalance();
      setBalance(currentBalance);
    };

    updateBalance();

    // Slušaj za custom event kada se balans promeni
    window.addEventListener("balanceUpdated", updateBalance);

    return () => {
      window.removeEventListener("balanceUpdated", updateBalance);
    };
  }, [location]);

  const navItems = [
    { path: "/matches", icon: Home, label: "Matches" },
    { path: "/profit", icon: TrendingUp, label: "Profit" },
    { path: "/groups", icon: Users, label: "Groups" },
    { path: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  ];

  // Formatiranje balansa sa bojom
  const getBalanceDisplay = () => {
    const balancePercent = balance.toFixed(1);
    const isNegative = balance < 0;
    const isBlocked = balance <= -100;

    return (
      <span
        className={`user-balance ${isNegative ? "negative" : "positive"} ${
          isBlocked ? "blocked" : ""
        }`}
      >
        Balance: {isNegative ? "" : "+"}
        {balancePercent}%
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
          {getBalanceDisplay()}
          <span className="user-name">{currentUser}</span>
          <button onClick={onLogout} className="logout-btn">
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
