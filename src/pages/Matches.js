import React, { useState, useEffect } from "react";
import { Target, Trophy } from "lucide-react";
import MatchCard from "../components/Matches/MatchCard";
import SkeletonCard from "../components/Loading/SkeletonCard";
import { matchesData, randomizeOdds } from "../data/matchesData";
import "../styles/Matches.css";

const Matches = ({ cartItems, setCartItems }) => {
  const [activeTab, setActiveTab] = useState("football");
  const [matches, setMatches] = useState({
    football: [],
    basketball: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const loadMatches = async () => {
      setLoading(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const footballWithRandomOdds = matchesData.football.map((match) => ({
        ...match,
        odds: randomizeOdds(match.odds),
      }));

      const basketballWithRandomOdds = matchesData.basketball.map((match) => ({
        ...match,
        odds: randomizeOdds(match.odds),
      }));

      setMatches({
        football: footballWithRandomOdds,
        basketball: basketballWithRandomOdds,
      });

      setLoading(false);
    };

    loadMatches();
  }, []);

  const handleOddClick = (match, betType, oddValue) => {
    // Proveri da li je ova kombinacija već u tiketu
    const existingItemIndex = cartItems.findIndex(
      (item) => item.match.id === match.id && item.betType === betType
    );

    if (existingItemIndex !== -1) {
      // Ako jeste, ukloni je (toggle off)
      setCartItems(cartItems.filter((_, index) => index !== existingItemIndex));
    } else {
      // Proveri da li postoji druga kvota za istu utakmicu
      const existingMatch = cartItems.find(
        (item) => item.match.id === match.id
      );

      if (existingMatch) {
        // Zameni postojeću kvotu sa novom
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
        // Dodaj novu utakmicu u tiket
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

  return (
    <div className="matches-container">
      <div className="matches-header">
        <h1>Sports Betting</h1>
        <p>Choose your matches and place your bets</p>
      </div>

      <div className="sports-tabs">
        <button
          className={`tab-button ${activeTab === "football" ? "active" : ""}`}
          onClick={() => setActiveTab("football")}
        >
          <Target size={20} />
          <span>Football</span>
          <span className="match-count">{matches.football.length}</span>
        </button>

        <button
          className={`tab-button ${activeTab === "basketball" ? "active" : ""}`}
          onClick={() => setActiveTab("basketball")}
        >
          <Trophy size={20} />
          <span>Basketball</span>
          <span className="match-count">{matches.basketball.length}</span>
        </button>
      </div>

      <div className="matches-list">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} type="match" />
          ))
        ) : (
          matches[activeTab].map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              sport={activeTab}
              onOddClick={handleOddClick}
              selectedBets={cartItems}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Matches;
