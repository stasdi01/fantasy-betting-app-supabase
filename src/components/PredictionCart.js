import React, { useState, useEffect } from "react";
import { X, Trash2, Target } from "lucide-react";
import { useBudget } from "../hooks/useBudget";
import { useAuth } from "../context/AuthContext";
import { useCustomLeagues } from "../hooks/useCustomLeagues";
import { useToast } from "../components/Toast/ToastProvider";
import LoadingSpinner from "./Loading/LoadingSpinner";
import { getBettingErrorMessage, logError } from "../utils/errorHandler";
import { supabase } from "../lib/supabase";
import "../styles/BettingCart.css";

const PredictionCart = ({ cartItems, setCartItems }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stake, setStake] = useState(10); // Default 10%
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [leagueType, setLeagueType] = useState('bet'); // 'bet' or 'myteam'
  const [selectedLeague, setSelectedLeague] = useState("public"); // "public" or league ID

  const { user, isPremium } = useAuth();
  const { success, error: showError, info } = useToast();
  const {
    betLeagueProfit,
    myTeamLeagueProfit,
    getAvailableBudget,
    canPlaceTicket,
    updateProfit,
    deductStake,
    getCustomLeagueBudget,
    getAvailableCustomLeagueBudget,
    canPlaceCustomLeagueBet,
    updateCustomLeagueProfit,
    deductCustomLeagueStake
  } = useBudget();

  const { joinedLeagues } = useCustomLeagues();

  // Transform joined leagues to match the expected format
  const joinedPools = joinedLeagues.map(membership => ({
    id: membership.custom_leagues?.id,
    name: membership.custom_leagues?.name,
    icon: membership.custom_leagues?.league_type === 'myteam' ? '🎯' : '🏆'
  })).filter(league => league.id); // Filter out any invalid leagues

  // Get budget based on selected league
  const getSelectedBudget = () => {
    if (selectedLeague === "public") {
      return getAvailableBudget(leagueType);
    } else {
      try {
        return getAvailableCustomLeagueBudget(selectedLeague);
      } catch (error) {
        console.warn('Error getting available custom league budget:', error);
        return 0;
      }
    }
  };

  const getSelectedProfit = () => {
    if (selectedLeague === "public") {
      return leagueType === 'myteam' ? myTeamLeagueProfit : betLeagueProfit;
    } else {
      try {
        const leagueBudget = getCustomLeagueBudget(selectedLeague);
        return leagueBudget?.profit || 0;
      } catch (error) {
        console.warn('Error getting custom league budget:', error);
        return 0;
      }
    }
  };

  const availableBudget = getSelectedBudget();
  const currentProfit = getSelectedProfit();

  useEffect(() => {
    // If current stake is higher than available budget, reduce it
    if (stake > availableBudget) {
      setStake(Math.min(10, availableBudget));
    }

    // Clear error if user is enabled again
    if (availableBudget > 0) {
      setError("");
    }
  }, [stake, availableBudget, selectedLeague]);

  // Reset stake when league selection changes
  useEffect(() => {
    const newBudget = getSelectedBudget();
    if (stake > newBudget) {
      setStake(Math.min(10, newBudget));
    }
  }, [selectedLeague]);

  // Listen for custom leagues updates to refresh joined leagues
  useEffect(() => {
    const handleCustomLeaguesUpdate = () => {
      console.log('PredictionCart: Custom leagues updated, refreshing...');
      // The custom leagues hook will automatically refresh when needed
    };

    window.addEventListener('custom-leagues-updated', handleCustomLeaguesUpdate);
    return () => window.removeEventListener('custom-leagues-updated', handleCustomLeaguesUpdate);
  }, []);

  // Remove match from ticket
  const removeFromCart = (itemId) => {
    setCartItems(cartItems.filter((item) => item.id !== itemId));
  };

  // Clear entire ticket
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate total odds
  const getTotalOdds = () => {
    if (cartItems.length === 0) return 0;
    return cartItems.reduce((total, item) => total * item.oddValue, 1);
  };

  const handlePlacePrediction = async () => {
    console.log('=== STARTING PREDICTION PLACEMENT ===');
    console.log('Cart items:', cartItems.length);
    if (cartItems.length === 0) {
      showError("Your prediction ticket is empty!");
      return;
    }

    // Debug selected league and budget info
    console.log('Selected league:', selectedLeague);
    console.log('League type:', leagueType);
    console.log('Stake:', stake);
    console.log('Available budget:', getSelectedBudget());

    if (selectedLeague !== "public") {
      console.log('Custom League budget:', getCustomLeagueBudget(selectedLeague));
      console.log('Available league budget:', getAvailableCustomLeagueBudget(selectedLeague));
    }

    // Validation based on selected league
    let validation;

    try {
      if (selectedLeague === "public") {
        validation = canPlaceTicket(stake, leagueType);
      } else {
        validation = canPlaceCustomLeagueBet(selectedLeague, stake);
      }
      console.log('Validation result:', validation);
    } catch (validationError) {
      console.error('Validation error:', validationError);
      showError("Validation failed: " + validationError.message);
      return;
    }

    if (!validation.canPlace) {
      showError(validation.reason);
      setError(validation.reason);
      return;
    }

    // Additional validation for stake
    if (stake < 1) {
      showError("Minimum stake is 1%!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Generate prediction status
      const generatePredictionStatus = () => {
        const random = Math.random();
        if (random < 0.4) return "won";
        if (random < 0.7) return "lost";
        return "pending";
      };

      const predictionStatus = generatePredictionStatus();
      const stakeAmount = parseFloat(stake);
      const potentialWinAmount = Math.round(stakeAmount * getTotalOdds() * 100) / 100;

      const predictionData = {
        user_id: user.id,
        match_data: {
          matches: cartItems,
          prediction_type: selectedLeague === "public" ? leagueType : "custom_league",
          custom_league_id: selectedLeague !== "public" ? selectedLeague : null
        },
        total_odds: getTotalOdds(),
        stake_amount: stakeAmount,
        potential_win: potentialWinAmount,
        status: predictionStatus,
        league_type: leagueType,
        month_year: new Date().toISOString().slice(0, 7), // YYYY-MM format
      };

      // Save prediction to database
      console.log('Saving prediction data:', predictionData);
      const { data: predictionResult, error: predictionError } = await supabase
        .from('predictions')
        .insert([predictionData]);

      console.log('Database insert result:', { predictionResult, predictionError });

      if (predictionError) {
        console.error('Database error:', predictionError);
        throw predictionError;
      }

      // Update profit based on prediction status and selected league
      console.log('Updating profit. Status:', predictionStatus, 'League:', selectedLeague);
      if (selectedLeague === "public") {
        // Public League prediction
        console.log('Updating public league profit...');
        if (predictionStatus === "won") {
          await updateProfit(stakeAmount, potentialWinAmount, true, leagueType);
        } else if (predictionStatus === "lost") {
          await updateProfit(stakeAmount, potentialWinAmount, false, leagueType);
        } else if (predictionStatus === "pending") {
          await deductStake(stakeAmount, leagueType);
        }
      } else {
        // Custom League prediction
        console.log('Updating custom league profit...');
        if (predictionStatus === "won") {
          await updateCustomLeagueProfit(selectedLeague, stakeAmount, potentialWinAmount, true);
        } else if (predictionStatus === "lost") {
          await updateCustomLeagueProfit(selectedLeague, stakeAmount, potentialWinAmount, false);
        } else if (predictionStatus === "pending") {
          await deductCustomLeagueStake(selectedLeague, stakeAmount);
        }
      }

      // Trigger global profit update event
      window.dispatchEvent(new CustomEvent('profit-updated'));

      if (predictionStatus === "won") {
        success(
          `🎉 Congratulations! Your prediction won ${potentialWinAmount.toFixed(2)}%!\nStake: ${stake}%`,
          "Prediction Won!"
        );
      } else if (predictionStatus === "lost") {
        info(
          `😔 Unfortunately, your prediction was incorrect.\nStake: ${stake}%\nPotential win: ${potentialWinAmount.toFixed(2)}%`,
          "Prediction Lost"
        );
      } else {
        info(
          `Prediction placed successfully!\nStake: ${stake}%\nPotential win: ${potentialWinAmount.toFixed(2)}%`,
          "Prediction Placed"
        );
      }

      // Clear cart
      clearCart();
      setStake(Math.min(10, getSelectedBudget()));
      setIsOpen(false);

    } catch (error) {
      console.error('Prediction error:', error);
      const errorMessage = error.message || "Something went wrong. Please try again.";
      showError(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPredictionTypeLabel = (predictionType, match) => {
    const labels = {
      home: match.homeTeam,
      draw: "Draw",
      away: match.awayTeam,
    };
    return labels[predictionType];
  };

  if (!isOpen) {
    return (
      <button className="cart-toggle-button" onClick={() => setIsOpen(true)}>
        <Target size={20} />
        {cartItems.length > 0 && (
          <span className="cart-badge">{cartItems.length}</span>
        )}
      </button>
    );
  }

  return (
    <div className="betting-cart">
      {/* Header */}
      <div className="cart-header">
        <h3>Prediction Ticket</h3>
        <button className="close-button" onClick={() => setIsOpen(false)}>
          <X size={20} />
        </button>
      </div>

      {/* Cart Items */}
      <div className="cart-items">
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <Target size={48} />
            <p>Your prediction ticket is empty</p>
            <span>Select odds to start predicting</span>
          </div>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="item-info">
                <div className="item-match">
                  {item.match.homeTeam} vs {item.match.awayTeam}
                </div>
                <div className="item-bet">
                  {getPredictionTypeLabel(item.betType, item.match)}
                </div>
                <div className="item-odd">Odds: {item.oddValue}</div>
              </div>
              <button
                className="remove-button"
                onClick={() => removeFromCart(item.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer with stake and button */}
      {cartItems.length > 0 && (
        <div className="cart-footer">
          <div className="total-odds">
            <span>Total Odds:</span>
            <span className="odds-value">{getTotalOdds().toFixed(2)}</span>
          </div>

          {/* League Selection */}
          <div className="pool-selection" style={{ marginBottom: '1rem' }}>
            <label style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
              Select League:
            </label>
            <select
              value={selectedLeague}
              onChange={(e) => {
                setSelectedLeague(e.target.value);
              }}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                marginBottom: '0.5rem'
              }}
              disabled={loading}
            >
              <option value="public">Public League</option>
              {joinedPools.map(league => (
                <option key={league.id} value={league.id}>
                  👑 {league.name} League
                </option>
              ))}
            </select>
          </div>

          {/* League Type Toggle (only for Public League) */}
          {selectedLeague === "public" && (
            <div className="league-type-toggle" style={{ marginBottom: '1rem' }}>
              <label style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                League Type:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="leagueType"
                    value="bet"
                    checked={leagueType === 'bet'}
                    onChange={(e) => {
                      setLeagueType(e.target.value);
                      // Reset stake when switching league type
                      const newBudget = getAvailableBudget(e.target.value);
                      if (stake > newBudget) {
                        setStake(Math.min(10, newBudget));
                      }
                    }}
                  />
                  <span style={{ color: 'var(--text-primary)' }}>BetLeague</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="leagueType"
                    value="myteam"
                    checked={leagueType === 'myteam'}
                    onChange={(e) => {
                      setLeagueType(e.target.value);
                      // Reset stake when switching league type
                      const newBudget = getAvailableBudget(e.target.value);
                      if (stake > newBudget) {
                        setStake(Math.min(10, newBudget));
                      }
                    }}
                  />
                  <span style={{ color: 'var(--primary-light)' }}>MyTeam</span>
                </label>
              </div>
            </div>
          )}

          <div className="stake-section">
            <label>Stake (%):</label>
            <div className="stake-input-group">
              <input
                type="number"
                min="1"
                max={availableBudget}
                value={stake}
                onChange={(e) => {
                  let value = Number(e.target.value);
                  // Limit between 1 and available budget
                  if (value < 1) value = 1;
                  if (value > availableBudget) value = availableBudget;
                  setStake(value);
                }}
                disabled={loading}
              />
              <span className="stake-suffix">%</span>
            </div>
            <small
              style={{
                color: availableBudget < 10 ? "var(--danger)" : "var(--text-muted)",
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                display: "block",
              }}
            >
              Available budget: {availableBudget.toFixed(1)}% | {selectedLeague === "public" ? "League" : "Custom"} profit:{" "}
              <span style={{ color: currentProfit >= 0 ? "var(--success)" : "var(--danger)" }}>
                {currentProfit >= 0 ? "+" : ""}{currentProfit.toFixed(1)}%
              </span>
            </small>
            {error && (
              <small style={{ color: "var(--danger)", fontSize: "0.75rem", display: "block", marginTop: "0.25rem" }}>
                {error}
              </small>
            )}
          </div>

          <div className="potential-win">
            <span>Potential Win:</span>
            <span className="win-value">
              {(stake * getTotalOdds()).toFixed(2)}%
            </span>
          </div>

          {availableBudget === 0 ? (
            <div
              style={{ color: "#ef4444", textAlign: "center", padding: "1rem" }}
            >
              {selectedLeague === "public"
                ? `${leagueType === 'myteam' ? 'MyTeam League' : 'BetLeague'} budget blocked! Monthly limit reached (-100% profit)`
                : "Custom League budget blocked! League limit reached (-100% profit)"
              }
            </div>
          ) : (
            <>
              <button
                className={`place-bet-button ${loading ? "loading-button" : ""}`}
                onClick={handlePlacePrediction}
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  <span className="button-text">
                    Place {selectedLeague === "public" ? (leagueType === 'myteam' ? "MyTeam " : "Bet ") : "Custom League "}Prediction
                  </span>
                )}
              </button>
              <button
                className="clear-button"
                onClick={clearCart}
                disabled={loading}
              >
                Clear Ticket
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PredictionCart;