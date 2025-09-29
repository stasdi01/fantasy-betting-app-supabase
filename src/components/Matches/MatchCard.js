import React from "react";
import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/MatchCard.css";

const MatchCard = ({ match, sport, onOddClick, selectedBets }) => {
  const navigate = useNavigate();

  const formatTime = (time) => {
    return time.slice(0, 5);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  // Check if odd is selected
  const isOddSelected = (betType) => {
    return selectedBets.some(
      (item) => item.match.id === match.id && item.betType === betType
    );
  };

  // Handle clicking on match (not on odds buttons)
  const handleMatchClick = (e) => {
    // Don't navigate if clicking on odds buttons
    if (e.target.closest('.odd-button')) return;

    navigate(`/match/${match.id}`, {
      state: { match, sport }
    });
  };

  return (
    <div className="match-card" onClick={handleMatchClick}>
      {/* Header with league and time */}
      <div className="match-header">
        <span className="league">{match.league}</span>
        <div className="match-time">
          <div className="time-indicator">
            <Clock size={14} />
            <span>
              {formatDate(match.date)} {formatTime(match.time)}
            </span>
          </div>
        </div>
      </div>

      {/* Teams */}
      <div className="teams-section">
        <div className="team home-team">
          <span className="team-name">{match.homeTeam}</span>
        </div>
        <div className="vs-divider">vs</div>
        <div className="team away-team">
          <span className="team-name">{match.awayTeam}</span>
        </div>
      </div>

      {/* Simple 1X2 Odds */}
      <div className="odds-section">
        <button
          className={`odd-button home-odd ${isOddSelected("home") ? "selected" : ""}`}
          onClick={() => onOddClick(match, "home", match.odds.home)}
        >
          <span className="odd-label">1</span>
          <span className="odd-value">{match.odds.home}</span>
        </button>

        {sport === "football" && (
          <button
            className={`odd-button draw-odd ${isOddSelected("draw") ? "selected" : ""}`}
            onClick={() => onOddClick(match, "draw", match.odds.draw)}
          >
            <span className="odd-label">X</span>
            <span className="odd-value">{match.odds.draw}</span>
          </button>
        )}

        <button
          className={`odd-button away-odd ${isOddSelected("away") ? "selected" : ""}`}
          onClick={() => onOddClick(match, "away", match.odds.away)}
        >
          <span className="odd-label">2</span>
          <span className="odd-value">{match.odds.away}</span>
        </button>
      </div>
    </div>
  );
};

export default MatchCard;
