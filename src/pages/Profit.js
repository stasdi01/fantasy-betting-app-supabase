import React, { useState, useEffect } from "react";
import { Calendar, ArrowLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useConfirm } from "../components/Toast/ConfirmDialog";
import { useToast } from "../components/Toast/ToastProvider";
import { useCustomLeagues } from "../hooks/useCustomLeagues";
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
  const { joinedLeagues, refreshData } = useCustomLeagues();

  // Filter to show only BetLeagues that user joined/created
  const joinedBetLeagues = joinedLeagues
    .filter(membership => membership.custom_leagues?.league_type === 'bet')
    .map(membership => ({
      id: membership.custom_leagues?.id,
      name: membership.custom_leagues?.name
    }))
    .filter(league => league.id);
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [filterType, setFilterType] = useState("all"); // all, free, premium, pool_5, pool_10, pool_15, pool_30
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(null); // null shows month list, string shows month details
  const [monthlyData, setMonthlyData] = useState({}); // grouped tickets by month

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

          // Determine bet type from prediction data
          let betType = "free";
          let leagueId = null;

          // Check if it's a custom league prediction
          if (prediction.match_data && prediction.match_data.custom_league_id) {
            betType = "custom_league";
            leagueId = prediction.match_data.custom_league_id;
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
            leagueId: leagueId,
            predictionChoice: prediction.prediction_choice,
            description: prediction.description
          };
        });

        setTickets(transformedTickets);

        // Group tickets by month
        const groupedByMonth = {};
        transformedTickets.forEach(ticket => {
          const date = new Date(ticket.date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

          if (!groupedByMonth[monthKey]) {
            groupedByMonth[monthKey] = {
              monthName,
              monthKey,
              tickets: [],
              year: date.getFullYear(),
              month: date.getMonth() + 1
            };
          }
          groupedByMonth[monthKey].tickets.push(ticket);
        });

        setMonthlyData(groupedByMonth);
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

  // Listen for custom leagues updates to refresh joined leagues
  useEffect(() => {
    const handleCustomLeaguesUpdate = () => {
      console.log('Profit: Custom leagues updated, refreshing...');
      if (refreshData) {
        refreshData();
      }
    };

    window.addEventListener('custom-leagues-updated', handleCustomLeaguesUpdate);
    return () => window.removeEventListener('custom-leagues-updated', handleCustomLeaguesUpdate);
  }, [refreshData]);

  const applyFilters = () => {
    // If a month is selected, filter tickets for that month
    let filtered = selectedMonth ? monthlyData[selectedMonth]?.tickets || [] : [...tickets];

    // Apply bet type filter
    switch (filterType) {
      case "free":
        filtered = filtered.filter((ticket) =>
          ticket.betType === "free" && !ticket.isPremiumBet
        );
        break;

      default:
        // Check if it's a custom league filter
        if (filterType.startsWith("league_")) {
          const leagueId = filterType.replace("league_", "");
          filtered = filtered.filter((ticket) =>
            ticket.leagueId && ticket.leagueId.toString() === leagueId
          );
        }
        // All types
        break;
    }

    setFilteredTickets(filtered);
  };

  // Apply filters whenever tickets, selectedMonth, or filterType changes
  useEffect(() => {
    applyFilters();
  }, [tickets, selectedMonth, filterType, monthlyData]);

  const selectMonth = (monthKey) => {
    setSelectedMonth(monthKey);
    setFilterType("all"); // Reset filter when changing months
  };

  const goBackToMonths = () => {
    setSelectedMonth(null);
    setFilterType("all");
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
        setMonthlyData({});
        setSelectedMonth(null);
        success("Betting history cleared successfully!");
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        logError(error, 'Profit.clearHistory');
        showError(errorMessage);
      }
    }
  };

  // Calculate statistics for a month
  const calculateMonthStats = (monthTickets) => {
    const wins = monthTickets.filter(t => t.status === 'won').length;
    const totalBets = monthTickets.length;
    const winRate = totalBets > 0 ? (wins / totalBets * 100).toFixed(1) : 0;
    const totalProfit = monthTickets.reduce((sum, t) => {
      if (t.status === 'won') return sum + (t.potentialWin - t.stake);
      if (t.status === 'lost') return sum - t.stake;
      return sum;
    }, 0);

    return { wins, totalBets, winRate, totalProfit };
  };

  if (selectedMonth === null) {
    // Show monthly overview
    const sortedMonths = Object.values(monthlyData).sort((a, b) =>
      new Date(b.year, b.month - 1) - new Date(a.year, a.month - 1)
    );

    return (
      <div className="profit-container">
        {/* Header */}
        <div className="profit-header">
          <div className="header-content">
            <h1>Profit & Statistics</h1>
            <p>Select a month to view your betting history</p>
          </div>
        </div>

        {/* Monthly Overview */}
        <div className="monthly-overview">
          {loading ? (
            <div className="months-list">
              {Array.from({ length: 3 }).map((_, index) => (
                <SkeletonCard key={index} type="month" />
              ))}
            </div>
          ) : sortedMonths.length === 0 ? (
            <div className="no-months">
              <Calendar size={48} />
              <h3>No betting history yet</h3>
              <p>You haven't placed any bets yet. Go to Matches to start betting!</p>
            </div>
          ) : (
            <div className="months-list">
              {sortedMonths.map((monthData) => {
                const stats = calculateMonthStats(monthData.tickets);
                return (
                  <div
                    key={monthData.monthKey}
                    className="month-card"
                    onClick={() => selectMonth(monthData.monthKey)}
                  >
                    <div className="month-header">
                      <h3>{monthData.monthName}</h3>
                      <ChevronRight size={20} />
                    </div>
                    <div className="month-stats">
                      <div className="stat">
                        <span className="stat-value">{stats.totalBets}</span>
                        <span className="stat-label">Total Bets</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{stats.winRate}%</span>
                        <span className="stat-label">Win Rate</span>
                      </div>
                      <div className="stat">
                        <span className={`stat-value ${stats.totalProfit >= 0 ? 'positive' : 'negative'}`}>
                          {stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit.toFixed(2)}%
                        </span>
                        <span className="stat-label">Profit</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Clear History Button */}
        {tickets.length > 0 && (
          <div className="actions-section">
            <button className="clear-btn" onClick={clearHistory}>
              Clear All History
            </button>
          </div>
        )}
      </div>
    );
  }

  // Show individual month details
  const currentMonthData = monthlyData[selectedMonth];

  return (
    <div className="profit-container">
      {/* Header */}
      <div className="profit-header">
        <div className="header-content">
          <button className="back-btn" onClick={goBackToMonths}>
            <ArrowLeft size={20} />
            Back to Months
          </button>
          <div>
            <h1>{currentMonthData?.monthName}</h1>
            <p>Betting history for this month</p>
          </div>
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
          {/* Custom BetLeagues */}
          {joinedBetLeagues.map((league) => (
            <button
              key={league.id}
              className={`filter-btn secondary ${filterType === `league_${league.id}` ? "active" : ""}`}
              onClick={() => filterByType(`league_${league.id}`)}
            >
              👑 {league.name}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics */}
      {filteredTickets.length > 0 && <ProfitStats tickets={filteredTickets} />}

      {/* Tickets List */}
      <div className="tickets-section">
        <div className="section-header">
          <h2>Betting History</h2>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="no-tickets">
            <Calendar size={48} />
            <h3>No tickets found</h3>
            <p>No bets found for the selected filters in this month.</p>
          </div>
        ) : (
          <div className="tickets-list">
            {filteredTickets.map((ticket, index) => (
              <TicketCard
                key={ticket.id || index}
                ticket={ticket}
                index={index}
                joinedBetLeagues={joinedBetLeagues}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profit;
