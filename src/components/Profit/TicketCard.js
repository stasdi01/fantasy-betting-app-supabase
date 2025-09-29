import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import "../../styles/TicketCard.css";

const TicketCard = ({ ticket, index, joinedBetLeagues = [] }) => {
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
      // Calculate correct profit: (stake * odds) - stake
      const totalWin = parseFloat(ticket.stake) * parseFloat(ticket.totalOdds);
      const profit = totalWin - parseFloat(ticket.stake);
      return `+${profit.toFixed(2)}%`;
    } else if (status === "lost") {
      return `-${ticket.stake}%`;
    }
    return "Pending";
  };

  const getBetTypeIndicator = () => {
    if (ticket.betType === "premium" || ticket.isPremiumBet) {
      return <span className="bet-type-badge premium">👑 MyTeam</span>;
    } else if (ticket.betType === "custom_league" && ticket.leagueId) {
      // Find the league name from joinedBetLeagues
      const league = joinedBetLeagues.find(l => l.id.toString() === ticket.leagueId.toString());
      const leagueName = league ? league.name : `League #${ticket.leagueId}`;
      return <span className="bet-type-badge premium">👑 {leagueName}</span>;
    }
    return <span className="bet-type-badge free">🆓 Free League</span>;
  };

  return (
    <div className={getStatusClass()}>
      <div className="ticket-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="ticket-info">
          <div className="ticket-left">
            <div className="ticket-number">
              {getStatusIcon()}
              Ticket #{ticket.id ? ticket.id : index + 1}
            </div>
            <div className="ticket-date">{formatDate(ticket.date)}</div>
          </div>

          <div className="ticket-right">
            <div className="ticket-summary">
              <div className="summary-item">
                <span className="summary-label">Odds</span>
                <span className="summary-value">{ticket.totalOdds}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Stake</span>
                <span className="summary-value">{ticket.stake}%</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Result</span>
                <span className={`summary-value ${status}`}>{getProfitLoss()}</span>
              </div>
            </div>

            {getBetTypeIndicator()}

            <button className="expand-button">
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        </div>
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
              <span className="win-amount">{(parseFloat(ticket.stake) * parseFloat(ticket.totalOdds)).toFixed(2)}%</span>
            </div>
            {status === "won" && (
              <div className="actual-win">
                <span>Won:</span>
                <span className="win-amount green">
                  +{(parseFloat(ticket.stake) * parseFloat(ticket.totalOdds)).toFixed(2)}%
                </span>
              </div>
            )}
            {status === "won" && (
              <div className="actual-win">
                <span>Profit:</span>
                <span className="win-amount green">
                  +{((parseFloat(ticket.stake) * parseFloat(ticket.totalOdds)) - parseFloat(ticket.stake)).toFixed(2)}%
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
