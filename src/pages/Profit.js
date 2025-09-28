import React, { useState, useEffect } from "react";
import { Calendar, Filter } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useConfirm } from "../components/Toast/ConfirmDialog";
import { useToast } from "../components/Toast/ToastProvider";
import SkeletonCard from "../components/Loading/SkeletonCard";
import { getErrorMessage, logError } from "../utils/errorHandler";
import { supabase } from "../lib/supabase";
import TicketCard from "../components/Profit/TicketCard";
import ProfitStats from "../components/Profit/ProfitStats";
import "../styles/Profit.css";

const Profit = () => {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const { success, error: showError } = useToast();
  // TODO: Replace with custom leagues data when Your Leagues system is implemented
  const joinedPools = [];
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState("all"); // all, today, week, month
  const [filterType, setFilterType] = useState("all"); // all, free, premium, pool_5, pool_10, pool_15, pool_30
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBets = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('predictions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          const errorMessage = getErrorMessage(error);
          logError(error, 'Profit.fetchBets');
          showError(errorMessage);
          return;
        }

        // Transform predictions data to match ticket format
        const transformedTickets = data.map(prediction => {
          // Handle match_data from predictions table
          let matches = [];
          if (prediction.match_data && prediction.match_data.matches) {
            matches = prediction.match_data.matches;
          } else if (Array.isArray(prediction.match_data)) {
            matches = prediction.match_data;
          }

          // Determine bet type from league_type and league_id
          let betType = "free";
          if (prediction.league_id) {
            betType = "custom_league";
          } else if (prediction.league_type === "MyTeam") {
            betType = "premium";
          }

          return {
            id: prediction.id,
            matches: matches,
            totalOdds: prediction.total_odds || 0,
            stake: prediction.stake_amount,
            potentialWin: prediction.potential_return || 0,
            status: prediction.status,
            date: prediction.created_at,
            isPremiumBet: prediction.league_type === "MyTeam",
            betType: betType,
            leagueType: prediction.league_type,
            leagueId: prediction.league_id,
            predictionChoice: prediction.prediction_choice,
            description: prediction.description
          };
        });

        setTickets(transformedTickets);
        setFilteredTickets(transformedTickets);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        logError(error, 'Profit.fetchBets');
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBets();
  }, [user]);

  const applyFilters = () => {
    const now = new Date();
    let filtered = [...tickets];

    // Apply time period filter
    switch (filterPeriod) {
      case "today":
        filtered = filtered.filter((ticket) => {
          const ticketDate = new Date(ticket.date);
          return ticketDate.toDateString() === now.toDateString();
        });
        break;

      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter((ticket) => {
          const ticketDate = new Date(ticket.date);
          return ticketDate >= weekAgo;
        });
        break;

      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter((ticket) => {
          const ticketDate = new Date(ticket.date);
          return ticketDate >= monthAgo;
        });
        break;

      default:
        // All time
        break;
    }

    // Apply bet type filter
    switch (filterType) {
      case "free":
        filtered = filtered.filter((ticket) =>
          ticket.betType === "free" && !ticket.isPremiumBet
        );
        break;


      case "pool_5":
      case "pool_10":
      case "pool_15":
      case "pool_30":
        filtered = filtered.filter((ticket) =>
          ticket.vipPoolId === filterType
        );
        break;

      default:
        // All types
        break;
    }

    setFilteredTickets(filtered);
  };

  // Apply filters whenever tickets, filterPeriod, or filterType changes
  useEffect(() => {
    applyFilters();
  }, [tickets, filterPeriod, filterType]);

  const filterTickets = (period) => {
    setFilterPeriod(period);
  };

  const filterByType = (type) => {
    setFilterType(type);
  };

  const clearHistory = async () => {
    const confirmed = await confirm({
      title: "Clear Betting History",
      message: "Are you sure you want to clear all betting history? This action cannot be undone.",
      type: "danger"
    });

    if (confirmed) {
      try {
        const { error } = await supabase
          .from('predictions')
          .delete()
          .eq('user_id', user.id);

        if (error) {
          const errorMessage = getErrorMessage(error);
          logError(error, 'Profit.clearHistory');
          showError(errorMessage);
          return;
        }

        setTickets([]);
        setFilteredTickets([]);
        success("Betting history cleared successfully!");
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        logError(error, 'Profit.clearHistory');
        showError(errorMessage);
      }
    }
  };

  return (
    <div className="profit-container">
      {/* Header */}
      <div className="profit-header">
        <div className="header-content">
          <h1>Profit & Statistics</h1>
          <p>Track your betting performance and history</p>
        </div>

        {/* Filter Buttons */}
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterPeriod === "all" ? "active" : ""}`}
            onClick={() => filterTickets("all")}
          >
            <Filter size={16} />
            All Time
          </button>
          <button
            className={`filter-btn ${filterPeriod === "today" ? "active" : ""}`}
            onClick={() => filterTickets("today")}
          >
            <Calendar size={16} />
            Today
          </button>
          <button
            className={`filter-btn ${filterPeriod === "week" ? "active" : ""}`}
            onClick={() => filterTickets("week")}
          >
            <Calendar size={16} />
            This Week
          </button>
          <button
            className={`filter-btn ${filterPeriod === "month" ? "active" : ""}`}
            onClick={() => filterTickets("month")}
          >
            <Calendar size={16} />
            This Month
          </button>
        </div>

        {/* Bet Type Filter */}
        <div className="bet-type-filters">
          <button
            className={`filter-btn secondary ${filterType === "all" ? "active" : ""}`}
            onClick={() => filterByType("all")}
          >
            All Bets
          </button>
          <button
            className={`filter-btn secondary ${filterType === "free" ? "active" : ""}`}
            onClick={() => filterByType("free")}
          >
            🆓 Free League
          </button>
          {/* TODO: Add custom league filters when Your Leagues system is implemented */}
        </div>
      </div>

      {/* Statistics */}
      {filteredTickets.length > 0 && <ProfitStats tickets={filteredTickets} />}

      {/* Tickets List */}
      <div className="tickets-section">
        <div className="section-header">
          <h2>Betting History</h2>
          {tickets.length > 0 && (
            <button className="clear-btn" onClick={clearHistory}>
              Clear History
            </button>
          )}
        </div>

        {loading ? (
          <div className="tickets-list">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonCard key={index} type="ticket" />
            ))}
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="no-tickets">
            <Calendar size={48} />
            <h3>No tickets found</h3>
            <p>
              {filterPeriod === "all"
                ? "You haven't placed any bets yet. Go to Matches to start betting!"
                : `No tickets found for the selected period.`}
            </p>
          </div>
        ) : (
          <div className="tickets-list">
            {filteredTickets.map((ticket, index) => (
              <TicketCard key={ticket.id || index} ticket={ticket} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profit;
