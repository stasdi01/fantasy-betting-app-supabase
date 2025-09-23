import React, { useState, useEffect } from "react";
import { Calendar, Filter } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import TicketCard from "../components/Profit/TicketCard";
import ProfitStats from "../components/Profit/ProfitStats";
import "../styles/Profit.css";

const Profit = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState("all"); // all, today, week, month
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBets = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('bets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching bets:', error);
          return;
        }

        // Transform Supabase data to match old localStorage format
        const transformedTickets = data.map(bet => ({
          id: bet.id,
          matches: bet.match_data,
          totalOdds: bet.total_odds,
          stake: bet.stake_amount,
          potentialWin: bet.potential_win,
          status: bet.status,
          date: bet.created_at,
          isPremiumBet: bet.is_premium_bet
        }));

        setTickets(transformedTickets);
        setFilteredTickets(transformedTickets);
      } catch (error) {
        console.error('Error in fetchBets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBets();
  }, [user]);

  const filterTickets = (period) => {
    setFilterPeriod(period);

    const now = new Date();
    let filtered = [...tickets];

    switch (period) {
      case "today":
        filtered = tickets.filter((ticket) => {
          const ticketDate = new Date(ticket.date);
          return ticketDate.toDateString() === now.toDateString();
        });
        break;

      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = tickets.filter((ticket) => {
          const ticketDate = new Date(ticket.date);
          return ticketDate >= weekAgo;
        });
        break;

      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = tickets.filter((ticket) => {
          const ticketDate = new Date(ticket.date);
          return ticketDate >= monthAgo;
        });
        break;

      default:
        filtered = tickets;
    }

    setFilteredTickets(filtered);
  };

  const clearHistory = async () => {
    if (window.confirm("Are you sure you want to clear all betting history?")) {
      try {
        const { error } = await supabase
          .from('bets')
          .delete()
          .eq('user_id', user.id);

        if (error) {
          console.error('Error clearing history:', error);
          return;
        }

        setTickets([]);
        setFilteredTickets([]);
      } catch (error) {
        console.error('Error in clearHistory:', error);
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
          <div className="no-tickets">
            <Calendar size={48} />
            <h3>Loading tickets...</h3>
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
