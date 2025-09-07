import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Layout from "./components/Layout";
import Matches from "./pages/Matches";
import Profit from "./pages/Profit";
import Groups from "./pages/Groups";
import Leaderboard from "./pages/Leaderboard";
import BettingCart from "./components/BettingCart";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [cartItems, setCartItems] = useState([]); // Dodaj ovu liniju

  const handleLogin = (username) => {
    setCurrentUser(username);
    setIsLoggedIn(true);
  };

  const handleRegister = (username) => {
    setCurrentUser(username);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setCurrentUser("");
    setIsLoggedIn(false);
    setCartItems([]); // Očisti cart pri logout
  };

  if (!isLoggedIn) {
    return showRegister ? (
      <Register
        onRegister={handleRegister}
        switchToLogin={() => setShowRegister(false)}
      />
    ) : (
      <Login
        onLogin={handleLogin}
        switchToRegister={() => setShowRegister(true)}
      />
    );
  }

  return (
    <Router>
      <Layout currentUser={currentUser} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/matches" replace />} />
          <Route
            path="/matches"
            element={
              <Matches cartItems={cartItems} setCartItems={setCartItems} />
            }
          />
          <Route path="/profit" element={<Profit />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </Layout>
      <BettingCart cartItems={cartItems} setCartItems={setCartItems} />
    </Router>
  );
}

export default App;
