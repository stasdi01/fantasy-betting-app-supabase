import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Trophy, Target, Zap } from "lucide-react";
import LoadingSpinner from "../components/Loading/LoadingSpinner";
import { matchesData, randomizeAllMarkets } from "../data/matchesData";
import "../styles/MatchDetail.css";

const MatchDetail = ({ cartItems, setCartItems }) => {
  const { matchId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [match, setMatch] = useState(null);
  const [sport, setSport] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatch = async () => {
      setLoading(true);

      // Try to get match from location state first
      if (location.state?.match && location.state?.sport) {
        setMatch(location.state.match);
        setSport(location.state.sport);
        setLoading(false);
        return;
      }

      // Otherwise find match in data
      const id = parseInt(matchId);
      let foundMatch = null;
      let foundSport = "";

      // Search in all sports
      for (const [sportType, matches] of Object.entries(matchesData)) {
        const matchFound = matches.find(m => m.id === id);
        if (matchFound) {
          foundMatch = randomizeAllMarkets(matchFound);
          foundSport = sportType;
          break;
        }
      }

      if (foundMatch) {
        setMatch(foundMatch);
        setSport(foundSport);
      }

      setLoading(false);
    };

    loadMatch();
  }, [matchId, location.state]);

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
        month: "long",
        day: "numeric",
        year: "numeric"
      });
    }
  };

  const getSportIcon = (sportType) => {
    switch(sportType) {
      case "football": return <Target size={24} />;
      case "basketball": return <Trophy size={24} />;
      case "tennis": return <Zap size={24} />;
      default: return <Target size={24} />;
    }
  };

  const getSportName = (sportType) => {
    switch(sportType) {
      case "football": return "Football";
      case "basketball": return "Basketball";
      case "tennis": return "Tennis";
      default: return "Sport";
    }
  };

  // Check if odd is selected
  const isOddSelected = (betType) => {
    return cartItems.some(
      (item) => item.match.id === match.id && item.betType === betType
    );
  };

  // Handle odd click
  const handleOddClick = (betType, oddValue) => {
    // Check if this bet is already selected
    const existingItemIndex = cartItems.findIndex(
      (item) => item.match.id === match.id && item.betType === betType
    );

    if (existingItemIndex !== -1) {
      // Remove if already selected (toggle off)
      setCartItems(cartItems.filter((_, index) => index !== existingItemIndex));
    } else {
      // Check if there's another bet for this match
      const existingMatch = cartItems.find(
        (item) => item.match.id === match.id
      );

      if (existingMatch) {
        // Replace existing bet with new one
        setCartItems(
          cartItems.map((item) =>
            item.match.id === match.id
              ? {
                  match,
                  betType,
                  oddValue,
                  id: `${match.id}-${betType}`,
                }
              : item
          )
        );
      } else {
        // Add new bet
        setCartItems([
          ...cartItems,
          {
            match,
            betType,
            oddValue,
            id: `${match.id}-${betType}`,
          },
        ]);
      }
    }
  };

  // Format bet labels for display
  const formatBetLabel = (betType) => {
    const labelMap = {
      // Football specific
      "over0.5": "Over 0.5",
      "under0.5": "Under 0.5",
      "over1.5": "Over 1.5",
      "under1.5": "Under 1.5",
      "over2.5": "Over 2.5",
      "under2.5": "Under 2.5",
      "over3.5": "Over 3.5",
      "under3.5": "Under 3.5",
      "over4.5": "Over 4.5",
      "under4.5": "Under 4.5",
      "yes": "Yes",
      "no": "No",
      "1X": "1X",
      "12": "12",
      "X2": "X2",
      "home-1": "1 (-1)",
      "draw-1": "X (-1)",
      "away+1": "2 (+1)",
      "home+1": "1 (+1)",
      "draw+1": "X (+1)",
      "away-1": "2 (-1)",
      "0-0": "0-0",
      "1-0": "1-0",
      "0-1": "0-1",
      "1-1": "1-1",
      "2-0": "2-0",
      "0-2": "0-2",
      "2-1": "2-1",
      "1-2": "1-2",
      "2-2": "2-2",
      "3-0": "3-0",
      "0-3": "0-3",
      "3-1": "3-1",
      "1-3": "1-3",
      "other": "Other",
      "over8.5": "Over 8.5",
      "under8.5": "Under 8.5",
      "over10.5": "Over 10.5",
      "under10.5": "Under 10.5",
      // Basketball specific
      "over215.5": "Over 215.5",
      "under215.5": "Under 215.5",
      "over220.5": "Over 220.5",
      "under220.5": "Under 220.5",
      "over225.5": "Over 225.5",
      "under225.5": "Under 225.5",
      "over230.5": "Over 230.5",
      "under230.5": "Under 230.5",
      "home-2.5": "1 (-2.5)",
      "away+2.5": "2 (+2.5)",
      "home-5.5": "1 (-5.5)",
      "away+5.5": "2 (+5.5)",
      "home+2.5": "1 (+2.5)",
      "away-2.5": "2 (-2.5)",
      "1Q_over52.5": "1Q Over 52.5",
      "1Q_under52.5": "1Q Under 52.5",
      "2Q_over54.5": "2Q Over 54.5",
      "2Q_under54.5": "2Q Under 54.5",
      "3Q_over55.5": "3Q Over 55.5",
      "3Q_under55.5": "3Q Under 55.5",
      "4Q_over53.5": "4Q Over 53.5",
      "4Q_under53.5": "4Q Under 53.5",
      "home_over110.5": "1 Over 110.5",
      "home_under110.5": "1 Under 110.5",
      "away_over105.5": "2 Over 105.5",
      "away_under105.5": "2 Under 105.5",
      // Tennis specific
      "2-0": "2-0",
      "2-1": "2-1",
      "0-2": "0-2",
      "1-2": "1-2",
      "over21.5": "Over 21.5",
      "under21.5": "Under 21.5",
      "over23.5": "Over 23.5",
      "under23.5": "Under 23.5",
      "over25.5": "Over 25.5",
      "under25.5": "Under 25.5",
      "home_over10.5": "1 Over 10.5",
      "home_under10.5": "1 Under 10.5",
      "away_over8.5": "2 Over 8.5",
      "away_under8.5": "2 Under 8.5",
      // Tennis sets specific
      "over2.5": "Over 2.5 Sets",
      "under2.5": "Under 2.5 Sets",
      "home-0.5": "1 (-0.5)",
      "away+0.5": "2 (+0.5)",
      "home+0.5": "1 (+0.5)",
      "away-0.5": "2 (-0.5)",
    };
    return labelMap[betType] || betType;
  };

  // Render market section
  const renderMarketSection = (title, market, prefix = "") => {
    if (!market) return null;

    return (
      <div className="market-section">
        <h3 className="market-title">{title}</h3>
        <div className="market-odds">
          {Object.entries(market).map(([key, value]) => {
            const betType = prefix ? `${prefix}_${key}` : key;
            return (
              <button
                key={betType}
                className={`market-odd-button ${isOddSelected(betType) ? "selected" : ""}`}
                onClick={() => handleOddClick(betType, value)}
              >
                <span className="odd-label">{formatBetLabel(key)}</span>
                <span className="odd-value">{value}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="match-detail-loading">
        <LoadingSpinner size="lg" />
        <p>Loading match details...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="match-detail-error">
        <h2>Match not found</h2>
        <button onClick={() => navigate('/matches')} className="btn-primary">
          <ArrowLeft size={18} />
          Back to Matches
        </button>
      </div>
    );
  }

  return (
    <div className="match-detail-container">
      {/* Header */}
      <div className="match-detail-header">
        <button
          className="back-button"
          onClick={() => navigate('/matches')}
        >
          <ArrowLeft size={20} />
          Back to Matches
        </button>

        <div className="sport-indicator">
          {getSportIcon(sport)}
          <span>{getSportName(sport)}</span>
        </div>
      </div>

      {/* Match Hero */}
      <div className="match-hero">
        <div className="match-hero-content">
          <div className="match-league">
            <span>{match.league}</span>
            <div className="match-time">
              <div className="time-indicator">
                <Clock size={16} />
                <span>
                  {formatDate(match.date)} at {formatTime(match.time)}
                </span>
              </div>
            </div>
          </div>

          <div className="teams-display">
            <div className="team home-team">
              <h1>{match.homeTeam}</h1>
            </div>
            <div className="vs-separator">vs</div>
            <div className="team away-team">
              <h1>{match.awayTeam}</h1>
            </div>
          </div>

          {/* Main 1X2 Odds */}
          <div className="main-odds-section">
            <button
              className={`main-odd-button home ${isOddSelected("home") ? "selected" : ""}`}
              onClick={() => handleOddClick("home", match.odds.home)}
            >
              <span className="odd-label">1</span>
              <span className="odd-value">{match.odds.home}</span>
              <span className="team-short">{match.homeTeam}</span>
            </button>

            {sport === "football" && (
              <button
                className={`main-odd-button draw ${isOddSelected("draw") ? "selected" : ""}`}
                onClick={() => handleOddClick("draw", match.odds.draw)}
              >
                <span className="odd-label">X</span>
                <span className="odd-value">{match.odds.draw}</span>
                <span className="team-short">Draw</span>
              </button>
            )}

            <button
              className={`main-odd-button away ${isOddSelected("away") ? "selected" : ""}`}
              onClick={() => handleOddClick("away", match.odds.away)}
            >
              <span className="odd-label">2</span>
              <span className="odd-value">{match.odds.away}</span>
              <span className="team-short">{match.awayTeam}</span>
            </button>
          </div>
        </div>
      </div>

      {/* All Betting Markets */}
      <div className="betting-markets">
        <h2>All Betting Markets</h2>

        <div className="markets-grid">
          {/* Football Markets */}
          {sport === "football" && match.markets && (
            <>
              {renderMarketSection("Over/Under Goals", match.markets.overUnder)}
              {renderMarketSection("Both Teams to Score", match.markets.bothTeamsToScore)}
              {renderMarketSection("Double Chance", match.markets.doubleChance)}
              {renderMarketSection("Correct Score", match.markets.correctScore)}
              {renderMarketSection("Corners", match.markets.corners)}
              {renderMarketSection("Cards", match.markets.cards)}
            </>
          )}

          {/* Basketball Markets */}
          {sport === "basketball" && match.markets && (
            <>
              {renderMarketSection("Total Points", match.markets.overUnder)}
              {renderMarketSection("Handicap", match.markets.handicap)}
              {renderMarketSection("Quarter Totals", match.markets.quarters)}
              {renderMarketSection("Team Totals", match.markets.teamTotals)}
            </>
          )}

          {/* Tennis Markets */}
          {sport === "tennis" && match.markets && (
            <>
              {renderMarketSection("Set Betting", match.markets.sets)}
              {renderMarketSection("Total Sets", match.markets.totalSets)}
              {renderMarketSection("Sets Handicap", match.markets.setsHandicap)}
              {renderMarketSection("Total Games", match.markets.totalGames)}
              {renderMarketSection("First Set", match.markets.firstSet)}
              {renderMarketSection("Tiebreak", match.markets.tiebreak)}
              {renderMarketSection("Aces", match.markets.aces)}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchDetail;