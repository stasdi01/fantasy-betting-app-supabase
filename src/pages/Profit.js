import React, { useState, useEffect } from "react";
import { Calendar, Filter } from "lucide-react";
import TicketCard from "../components/Profit/TicketCard";
import ProfitStats from "../components/Profit/ProfitStats";
import "../styles/Profit.css";

const Profit = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState("all"); // all, today, week, month

  useEffect(() => {
    // Učitaj tikete iz localStorage
    const savedTickets = JSON.parse(localStorage.getItem("userBets") || "[]");
    setTickets(savedTickets);
    setFilteredTickets(savedTickets);
  }, []);

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

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear all betting history?")) {
      localStorage.removeItem("userBets");
      setTickets([]);
      setFilteredTickets([]);
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

        {filteredTickets.length === 0 ? (
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
              <TicketCard key={index} ticket={ticket} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profit;
