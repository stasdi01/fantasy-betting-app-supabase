import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, TrendingUp, Trophy, Users, LogOut } from "lucide-react";
import "../styles/Layout.css";

const Layout = ({ children, currentUser, onLogout }) => {
  const location = useLocation();

  const navItems = [
    { path: "/matches", icon: Home, label: "Matches" },
    { path: "/profit", icon: TrendingUp, label: "Profit" },
    { path: "/groups", icon: Users, label: "Groups" },
    { path: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  ];

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <h1>BETIFY</h1>
        </div>
        <div className="header-right">
          <span className="user-balance">Balance: 100%</span>
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
