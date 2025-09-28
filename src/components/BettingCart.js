import React, { useState, useEffect } from "react";
import { X, Trash2, ShoppingCart } from "lucide-react";
import { useBudget } from "../hooks/useBudget";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast/ToastProvider";
import LoadingSpinner from "./Loading/LoadingSpinner";
import { getBettingErrorMessage, logError } from "../utils/errorHandler";
import { supabase } from "../lib/supabase";
import "../styles/BettingCart.css";

const BettingCart = ({ cartItems, setCartItems }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stake, setStake] = useState(10); // Default 10%
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPremiumBet, setIsPremiumBet] = useState(false);
  const [selectedPool, setSelectedPool] = useState("free"); // "free" or pool ID

  const { user, isPremium } = useAuth();
  const { success, error: showError, info } = useToast();
  const {
    betLeagueProfit,
    myTeamLeagueProfit,
    getAvailableBudget,
    canPlaceTicket,
    updateProfit,
    deductStake,
    // TODO: Add custom league budget functions when Your Leagues system is implemented
  } = useBudget();

  // TODO: Replace with custom leagues data when Your Leagues system is implemented
  const joinedPools = [];

  // Get budget based on selected pool
  const getSelectedBudget = () => {
    if (selectedPool === "free") {
      return getAvailableBudget(isPremiumBet);
    } else {
      // TODO: Add custom league budget handling when Your Leagues system is implemented
      return 0;
    }
  };

  const getSelectedProfit = () => {
    if (selectedPool === "free") {
      return isPremiumBet ? myTeamLeagueProfit : betLeagueProfit;
    } else {
      // TODO: Add custom league profit handling when Your Leagues system is implemented
      return 0;
    }
  };

  const availableBudget = getSelectedBudget();
  const currentProfit = getSelectedProfit();

  useEffect(() => {
    // Ako je trenutni stake veći od dostupnog budžeta, smanji ga
    if (stake > availableBudget) {
      setStake(Math.min(10, availableBudget));
    }

    // Očisti error ako je korisnik ponovo omogućen
    if (availableBudget > 0) {
      setError("");
    }
  }, [stake, availableBudget, selectedPool]);

  // Reset stake when pool selection changes
  useEffect(() => {
    const newBudget = getSelectedBudget();
    if (stake > newBudget) {
      setStake(Math.min(10, newBudget));
    }
  }, [selectedPool]);

  // TODO: Listen for custom leagues updates when Your Leagues system is implemented

  // Ukloni utakmicu iz tiketa
  const removeFromCart = (itemId) => {
    setCartItems(cartItems.filter((item) => item.id !== itemId));
  };

  // Očisti ceo tiket
  const clearCart = () => {
    setCartItems([]);
  };

  // Izračunaj totalnu kvotu
  const getTotalOdds = () => {
    if (cartItems.length === 0) return 0;
    return cartItems.reduce((total, item) => total * item.oddValue, 1);
  };

  const handlePlaceBet = async () => {
    console.log('=== STARTING BET PLACEMENT ===');
    console.log('Cart items:', cartItems.length);
    if (cartItems.length === 0) {
      showError("Your ticket is empty!");
      return;
    }

    // Debug selected pool and budget info
    console.log('Selected pool:', selectedPool);
    console.log('Stake:', stake);
    console.log('Is premium bet:', isPremiumBet);
    console.log('Available budget:', getSelectedBudget());

    // Validacija based on selected pool
    let validation;

    try {
      if (selectedPool === "free") {
        validation = canPlaceTicket(stake, isPremiumBet);
      } else {
        // TODO: Add custom league validation when Your Leagues system is implemented
        validation = { canPlace: false, reason: "Custom leagues not yet implemented" };
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

    // Dodatna validacija za stake
    if (stake < 1) {
      showError("Minimum stake is 1%!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Generiši status tiketa
      const generateTicketStatus = () => {
        const random = Math.random();
        if (random < 0.4) return "won";
        if (random < 0.7) return "lost";
        return "pending";
      };

      const ticketStatus = generateTicketStatus();
      const stakeAmount = parseFloat(stake);
      const potentialWinAmount = Math.round(stakeAmount * getTotalOdds() * 100) / 100;

      const betData = {
        user_id: user.id,
        match_data: {
          matches: cartItems,
          bet_type: selectedPool === "free" ? (isPremiumBet ? "premium" : "free") : "vip_pool",
          vip_pool_id: selectedPool !== "free" ? selectedPool : null
        },
        total_odds: getTotalOdds(),
        stake_amount: stakeAmount,
        potential_win: potentialWinAmount,
        status: ticketStatus,
        is_premium_bet: isPremiumBet,
        month_year: new Date().toISOString().slice(0, 7), // YYYY-MM format
      };

      // Save bet to database
      console.log('Saving bet data:', betData);
      const { data: betResult, error: betError } = await supabase
        .from('bets')
        .insert([betData]);

      console.log('Database insert result:', { betResult, betError });

      if (betError) {
        console.error('Database error:', betError);
        throw betError;
      }

      // Update profit based on bet status and selected pool
      console.log('Updating profit. Status:', ticketStatus, 'Pool:', selectedPool);
      if (selectedPool === "free") {
        // Free League betting
        console.log('Updating free league profit...');
        if (ticketStatus === "won") {
          await updateProfit(stakeAmount, potentialWinAmount, true, isPremiumBet);
        } else if (ticketStatus === "lost") {
          await updateProfit(stakeAmount, potentialWinAmount, false, isPremiumBet);
        } else if (ticketStatus === "pending") {
          await deductStake(stakeAmount, isPremiumBet);
        }
      } else {
        // TODO: Custom League betting when Your Leagues system is implemented
        console.log('Custom league betting not yet implemented');
      }

      // Trigger global profit update event
      window.dispatchEvent(new CustomEvent('profit-updated'));

      if (ticketStatus === "won") {
        success(
          `🎉 Congratulations! You won ${potentialWinAmount.toFixed(2)}%!\nStake: ${stake}%`,
          "Bet Won!"
        );
      } else if (ticketStatus === "lost") {
        info(
          `😔 Unfortunately, you lost this bet.\nStake: ${stake}%\nPotential win: ${potentialWinAmount.toFixed(2)}%`,
          "Bet Lost"
        );
      } else {
        info(
          `Bet placed successfully!\nStake: ${stake}%\nPotential win: ${potentialWinAmount.toFixed(2)}%`,
          "Bet Placed"
        );
      }

      // Clear cart
      clearCart();
      setStake(Math.min(10, getSelectedBudget()));
      setIsOpen(false);

    } catch (error) {
      console.error('Betting error:', error);
      const errorMessage = error.message || "Something went wrong. Please try again.";
      showError(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getBetTypeLabel = (betType, match) => {
    const labels = {
      home: match.homeTeam,
      draw: "Draw",
      away: match.awayTeam,
    };
    return labels[betType];
  };

  if (!isOpen) {
    return (
      <button className="cart-toggle-button" onClick={() => setIsOpen(true)}>
        <ShoppingCart size={20} />
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
        <h3>Betting Ticket</h3>
        <button className="close-button" onClick={() => setIsOpen(false)}>
          <X size={20} />
        </button>
      </div>

      {/* Cart Items */}
      <div className="cart-items">
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <ShoppingCart size={48} />
            <p>Your ticket is empty</p>
            <span>Select odds to start betting</span>
          </div>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="item-info">
                <div className="item-match">
                  {item.match.homeTeam} vs {item.match.awayTeam}
                </div>
                <div className="item-bet">
                  {getBetTypeLabel(item.betType, item.match)}
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

      {/* Footer sa ulogom i dugmetom */}
      {cartItems.length > 0 && (
        <div className="cart-footer">
          <div className="total-odds">
            <span>Total Odds:</span>
            <span className="odds-value">{getTotalOdds().toFixed(2)}</span>
          </div>

          {/* Pool Selection */}
          <div className="pool-selection" style={{ marginBottom: '1rem' }}>
            <label style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
              Select Budget:
            </label>
            <select
              value={selectedPool}
              onChange={(e) => {
                setSelectedPool(e.target.value);
                // Reset premium bet when switching to pool
                if (e.target.value !== "free") {
                  setIsPremiumBet(false);
                }
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
              <option value="free">Free League</option>
              {joinedPools.map(pool => (
                <option key={pool.id} value={pool.id}>
                  👑 {pool.name} Pool
                </option>
              ))}
            </select>
          </div>

          {/* Premium Bet Toggle (only for Free League) */}
          {isPremium && selectedPool === "free" && (
            <div className="premium-bet-toggle" style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isPremiumBet}
                  onChange={(e) => {
                    setIsPremiumBet(e.target.checked);
                    // Reset stake when switching budget type
                    const newBudget = getAvailableBudget(e.target.checked);
                    if (stake > newBudget) {
                      setStake(Math.min(10, newBudget));
                    }
                  }}
                />
                <span style={{ color: 'var(--primary-light)', fontWeight: '600' }}>
                  Premium Bet (100% budget)
                </span>
              </label>
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
                  // Ograniči između 1 i dostupnog budžeta
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
              Available budget: {availableBudget.toFixed(1)}% | {selectedPool === "free" ? "League" : "Pool"} profit:{" "}
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
              {selectedPool === "free"
                ? (isPremiumBet ? "Premium budget" : "Account") + " blocked! Monthly limit reached (-100% profit)"
                : "VIP Pool budget blocked! Pool limit reached (-100% profit)"
              }
            </div>
          ) : (
            <>
              <button
                className={`place-bet-button ${loading ? "loading-button" : ""}`}
                onClick={handlePlaceBet}
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  <span className="button-text">
                    Place {selectedPool === "free" ? (isPremiumBet ? "Premium " : "") : "VIP Pool "}Bet
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

export default BettingCart;
