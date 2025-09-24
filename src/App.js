import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useNetworkStatus } from "./hooks/useNetworkStatus";
import { ToastProvider } from "./components/Toast/ToastProvider";
import { ConfirmProvider } from "./components/Toast/ConfirmDialog";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Layout from "./components/Layout";
import Matches from "./pages/Matches";
import Profit from "./pages/Profit";
import Groups from "./pages/Groups";
import Leaderboard from "./pages/Leaderboard";
import BettingCart from "./components/BettingCart";
import "./App.css";
import "./styles/theme.css";

const AppContent = () => {
  const { isAuthenticated, loading, profile } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // Network status monitoring
  useNetworkStatus();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return showRegister ? (
      <Register switchToLogin={() => setShowRegister(false)} />
    ) : (
      <Login switchToRegister={() => setShowRegister(true)} />
    );
  }

  return (
    <Router>
      <Layout>
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
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <ConfirmProvider>
            <AppContent />
          </ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
