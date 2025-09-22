import React, { useState, useEffect } from "react";
import { X, Trash2, ShoppingCart } from "lucide-react";
import {
  calculateBalance,
  canPlaceBet,
  getCurrentMonthKey,
  getMaxStake,
} from "../utils/budgetUtils";
import "../styles/BettingCart.css";

const BettingCart = ({ cartItems, setCartItems }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stake, setStake] = useState(10); // Default 10%
  const [maxAllowedStake, setMaxAllowedStake] = useState(100);
  const [currentBalance, setCurrentBalance] = useState(0);

  useEffect(() => {
    // Ažuriraj maksimalni dozvoljeni ulog kada se promeni balans
    const updateMaxStake = () => {
      const maxStake = getMaxStake();
      setMaxAllowedStake(maxStake);
      setCurrentBalance(calculateBalance());

      // Ako je trenutni stake veći od dozvoljenog, smanji ga
      if (stake > maxStake) {
        setStake(Math.min(10, maxStake));
      }
    };

    updateMaxStake();
    window.addEventListener("balanceUpdated", updateMaxStake);

    return () => {
      window.removeEventListener("balanceUpdated", updateMaxStake);
    };
  }, [stake]);

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

  const handlePlaceBet = () => {
    if (cartItems.length === 0) {
      alert("Your ticket is empty!");
      return;
    }

    // Proveri da li korisnik može da se kladi
    if (!canPlaceBet()) {
      alert(
        "You've reached the monthly limit of -100%. You cannot place more bets this month."
      );
      return;
    }

    // Proveri da li stake prelazi dozvoljeni limit
    if (stake > maxAllowedStake) {
      alert(
        `Maximum stake allowed is ${maxAllowedStake.toFixed(
          1
        )}% based on your current balance.`
      );
      return;
    }

    // Dodatna validacija za stake
    if (stake < 1) {
      alert("Minimum stake is 1%!");
      return;
    }

    // Generiši status tiketa
    const generateTicketStatus = () => {
      const random = Math.random();
      if (random < 0.4) return "won";
      if (random < 0.7) return "lost";
      return "pending";
    };

    const currentMonth = getCurrentMonthKey();
    const ticketStatus = generateTicketStatus();

    const betData = {
      id: Date.now(),
      matches: cartItems,
      totalOdds: getTotalOdds().toFixed(2),
      stake: stake,
      potentialWin: (stake * getTotalOdds()).toFixed(2),
      date: new Date().toISOString(),
      status: ticketStatus,
      month: currentMonth,
    };

    // Ažuriraj mesečni budžet
    const monthData = JSON.parse(
      localStorage.getItem(`month_${currentMonth}`)
    ) || {
      startBalance: 0,
      currentBalance: 0,
      tickets: [],
    };

    // Dodaj tiket u mesečne podatke
    monthData.tickets.push(betData);

    // Odmah oduzmi ulog od balansa
    monthData.currentBalance -= parseFloat(stake);

    // Ako je tiket odmah dobitan, dodaj dobitak
    if (ticketStatus === "won") {
      monthData.currentBalance += parseFloat(betData.potentialWin);
    }

    localStorage.setItem(`month_${currentMonth}`, JSON.stringify(monthData));

    // Sačuvaj i u stari sistem
    const existingBets = JSON.parse(localStorage.getItem("userBets") || "[]");
    existingBets.push(betData);
    localStorage.setItem("userBets", JSON.stringify(existingBets));

    // Triggeruj event da se ažurira balans
    window.dispatchEvent(new Event("balanceUpdated"));

    let message = `Bet placed successfully!\nStake: ${stake}%\nPotential win: ${betData.potentialWin}%`;

    if (betData.status === "won") {
      message += `\n\n🎉 Congratulations! You won ${betData.potentialWin}%!`;
    } else if (betData.status === "lost") {
      message += `\n\n😔 Unfortunately, you lost this bet.`;
    }

    alert(message);

    // Očisti tiket
    clearCart();
    setStake(Math.min(10, getMaxStake()));
    setIsOpen(false);
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

          <div className="stake-section">
            <label>Stake (%):</label>
            <div className="stake-input-group">
              <input
                type="number"
                min="1"
                max={maxAllowedStake}
                value={stake}
                onChange={(e) => {
                  let value = Number(e.target.value);
                  // Ograniči između 1 i maksimalno dozvoljenog
                  if (value < 1) value = 1;
                  if (value > maxAllowedStake) value = maxAllowedStake;
                  setStake(value);
                }}
              />
              <span className="stake-suffix">%</span>
            </div>
            <small
              style={{
                color: maxAllowedStake < 10 ? "var(--danger)" : "var(--text-muted)",
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                display: "block",
              }}
            >
              Max allowed: {maxAllowedStake.toFixed(1)}% | Current balance:{" "}
              {currentBalance.toFixed(1)}%
            </small>
          </div>

          <div className="potential-win">
            <span>Potential Win:</span>
            <span className="win-value">
              {(stake * getTotalOdds()).toFixed(2)}%
            </span>
          </div>

          {maxAllowedStake === 0 ? (
            <div
              style={{ color: "#ef4444", textAlign: "center", padding: "1rem" }}
            >
              Monthly limit reached (-100%)
            </div>
          ) : (
            <>
              <button className="place-bet-button" onClick={handlePlaceBet}>
                Place Bet
              </button>
              <button className="clear-button" onClick={clearCart}>
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
