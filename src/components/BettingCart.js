import React, { useState, useEffect } from "react";
import { X, Trash2, ShoppingCart } from "lucide-react";
import { useBudget } from "../hooks/useBudget";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import "../styles/BettingCart.css";

const BettingCart = ({ cartItems, setCartItems }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stake, setStake] = useState(10); // Default 10%
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPremiumBet, setIsPremiumBet] = useState(false);

  const { user, isPremium } = useAuth();
  const {
    freeProfit,
    premiumProfit,
    getAvailableBudget,
    canPlaceTicket,
    updateProfit
  } = useBudget();

  const availableBudget = getAvailableBudget(isPremiumBet);
  const currentProfit = isPremiumBet ? premiumProfit : freeProfit;

  useEffect(() => {
    // Ako je trenutni stake veći od dostupnog budžeta, smanji ga
    if (stake > availableBudget) {
      setStake(Math.min(10, availableBudget));
    }

    // Očisti error ako je korisnik ponovo omogućen
    if (availableBudget > 0) {
      setError("");
    }
  }, [stake, availableBudget]);

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
    if (cartItems.length === 0) {
      alert("Your ticket is empty!");
      return;
    }

    // Koristi novi sistem validacije
    const validation = canPlaceTicket(stake, isPremiumBet);
    if (!validation.canPlace) {
      alert(validation.reason);
      setError(validation.reason);
      return;
    }

    // Dodatna validacija za stake
    if (stake < 1) {
      alert("Minimum stake is 1%!");
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
        match_data: cartItems,
        total_odds: getTotalOdds(),
        stake_amount: stakeAmount,
        potential_win: potentialWinAmount,
        status: ticketStatus,
        is_premium_bet: isPremiumBet,
        month_year: new Date().toISOString().slice(0, 7), // YYYY-MM format
      };

      // Save bet to database
      const { error: betError } = await supabase
        .from('bets')
        .insert([betData]);

      if (betError) {
        throw betError;
      }

      // Update profit if bet is settled
      if (ticketStatus === "won") {
        await updateProfit(stakeAmount, potentialWinAmount, true, isPremiumBet);
      } else if (ticketStatus === "lost") {
        await updateProfit(stakeAmount, potentialWinAmount, false, isPremiumBet);
      }

      // Trigger global profit update event
      window.dispatchEvent(new CustomEvent('profit-updated'));

      let message = `Bet placed successfully!\nStake: ${stake}%\nPotential win: ${potentialWinAmount.toFixed(2)}%`;

      if (ticketStatus === "won") {
        message += `\n\n🎉 Congratulations! You won ${potentialWinAmount.toFixed(2)}%!`;
      } else if (ticketStatus === "lost") {
        message += `\n\n😔 Unfortunately, you lost this bet.`;
      }

      alert(message);

      // Clear cart
      clearCart();
      setStake(Math.min(10, getAvailableBudget(isPremiumBet)));
      setIsOpen(false);

    } catch (error) {
      console.error('Error placing bet:', error);
      setError('Failed to place bet. Please try again.');
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

          {/* Premium Bet Toggle */}
          {isPremium && (
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
              Available budget: {availableBudget.toFixed(1)}% | Current profit:{" "}
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
              {isPremiumBet ? "Premium budget" : "Account"} blocked! Monthly limit reached (-100% profit)
            </div>
          ) : (
            <>
              <button
                className="place-bet-button"
                onClick={handlePlaceBet}
                disabled={loading}
              >
                {loading ? "Placing bet..." : `Place ${isPremiumBet ? "Premium " : ""}Bet`}
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
