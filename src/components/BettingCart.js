import React, { useState } from "react";
import { X, Trash2, ShoppingCart } from "lucide-react";
import "../styles/BettingCart.css";

const BettingCart = ({ cartItems, setCartItems }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stake, setStake] = useState(10); // Default 10%
  const [userBalance] = useState(100); // Kasnije ćemo ovo čuvati u state-u

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

    // Dodatna validacija za stake
    if (stake < 1 || stake > 100) {
      alert("Stake must be between 1% and 100%!");
      return;
    }

    if (stake > userBalance) {
      alert("Insufficient balance!");
      return;
    }

    // Generiši status tiketa JEDNOM pri kreiranju
    const generateTicketStatus = () => {
      const random = Math.random();
      if (random < 0.4) return "won";
      if (random < 0.7) return "lost";
      return "pending";
    };

    const betData = {
      id: Date.now(), // Dodaj jedinstveni ID
      matches: cartItems,
      totalOdds: getTotalOdds().toFixed(2),
      stake: stake,
      potentialWin: (stake * getTotalOdds()).toFixed(2),
      date: new Date().toISOString(),
      status: generateTicketStatus(), // Dodaj status OVDE, samo jednom!
    };

    console.log("Bet placed:", betData);

    // Izračunaj profit/gubitak na osnovu statusa
    let message = `Bet placed successfully!\nStake: ${stake}%\nPotential win: ${betData.potentialWin}%`;

    // Ako želiš, možeš odmah reći korisniku da li je dobio
    // ali ovo je opciono - možda je bolje da sačeka da vidi na Profit stranici
    /*
  if (betData.status === 'won') {
    message += `\n\n🎉 Congratulations! You won ${betData.potentialWin}%!`;
  } else if (betData.status === 'lost') {
    message += `\n\n😔 Unfortunately, you lost this bet.`;
  }
  */

    alert(message);

    // Sačuvaj tiket u localStorage
    const existingBets = JSON.parse(localStorage.getItem("userBets") || "[]");
    existingBets.push(betData);
    localStorage.setItem("userBets", JSON.stringify(existingBets));

    // Očisti tiket nakon klađenja
    clearCart();
    setStake(10);
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
                max="100"
                value={stake}
                onChange={(e) => {
                  let value = Number(e.target.value);
                  // Ograniči između 1 i 100
                  if (value < 1) value = 1;
                  if (value > 100) value = 100;
                  setStake(value);
                }}
              />
              <span className="stake-suffix">%</span>
            </div>
            <small
              style={{
                color: "#64748b",
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                display: "block",
              }}
            >
              Min: 1% | Max: 100% | Available: {userBalance}%
            </small>
          </div>
          <div className="potential-win">
            <span>Potential Win:</span>
            <span className="win-value">
              {(stake * getTotalOdds()).toFixed(2)}%
            </span>
          </div>
          <button className="place-bet-button" onClick={handlePlaceBet}>
            Place Bet
          </button>
          <button className="clear-button" onClick={clearCart}>
            Clear Ticket
          </button>
        </div>
      )}
    </div>
  );
};

export default BettingCart;
