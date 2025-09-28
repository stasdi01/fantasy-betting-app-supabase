import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import "../../styles/TicketCard.css";

const TicketCard = ({ ticket, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Koristi status iz tiketa umesto random generisanja
  const status = ticket.status || "pending"; // Ako nema status (stari tiketi), stavi pending

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getBetTypeLabel = (betType, match) => {
    const labels = {
      home: match.homeTeam,
      draw: "Draw",
      away: match.awayTeam,
    };
    return labels[betType];
  };

  const getStatusIcon = () => {
    switch (status) {
      case "won":
        return <CheckCircle size={20} className="status-icon won" />;
      case "lost":
        return <XCircle size={20} className="status-icon lost" />;
      default:
        return <Clock size={20} className="status-icon pending" />;
    }
  };

  const getStatusClass = () => {
    return `ticket-card ${status}`;
  };

  const getProfitLoss = () => {
    if (status === "won") {
      return `+${(
        parseFloat(ticket.potentialWin) - parseFloat(ticket.stake)
      ).toFixed(2)}%`;
    } else if (status === "lost") {
      return `-${ticket.stake}%`;
    }
    return "Pending";
  };

  const getBetTypeIndicator = () => {
    // TODO: Add custom league indicator when Your Leagues system is implemented
    if (ticket.betType === "premium" || ticket.isPremiumBet) {
      return <span className="bet-type-badge premium">👑 Premium</span>;
    }
    return <span className="bet-type-badge free">🆓 Free League</span>;
  };

  return (
    <div className={getStatusClass()}>
      <div className="ticket-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="ticket-info">
          <div className="ticket-number">
            Ticket #{ticket.id ? ticket.id : index + 1}
            {getStatusIcon()}
          </div>
          <div className="ticket-date">{formatDate(ticket.date)}</div>
          {getBetTypeIndicator()}
        </div>

        <div className="ticket-summary">
          <div className="ticket-odds">
            <span className="label">Odds:</span>
            <span className="value">{ticket.totalOdds}</span>
          </div>
          <div className="ticket-stake">
            <span className="label">Stake:</span>
            <span className="value">{ticket.stake}%</span>
          </div>
          <div className={`ticket-profit ${status}`}>
            <span className="label">Profit:</span>
            <span className="value">{getProfitLoss()}</span>
          </div>
        </div>

        <button className="expand-button">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {isExpanded && (
        <div className="ticket-details">
          <div className="matches-list">
            {ticket.matches.map((item, idx) => (
              <div key={idx} className="match-detail">
                <div className="match-teams">
                  {item.match.homeTeam} vs {item.match.awayTeam}
                </div>
                <div className="match-bet">
                  <span className="bet-type">
                    {getBetTypeLabel(item.betType, item.match)}
                  </span>
                  <span className="bet-odd">@ {item.oddValue}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="ticket-footer">
            <div className="potential-win">
              <span>Potential Win:</span>
              <span className="win-amount">{ticket.potentialWin}%</span>
            </div>
            {status === "won" && (
              <div className="actual-win">
                <span>Won:</span>
                <span className="win-amount green">
                  +{ticket.potentialWin}%
                </span>
              </div>
            )}
            {status === "lost" && (
              <div className="actual-loss">
                <span>Lost:</span>
                <span className="loss-amount red">-{ticket.stake}%</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketCard;
