import React from "react";
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";
import "../../styles/ProfitStats.css";

const RealProfitStats = ({ tickets, leagueId = null, getCustomLeagueBudget }) => {
  // Calculate stats using REAL budget data for custom leagues
  const calculateStats = () => {
    let totalStaked = 0;
    let wonCount = 0;
    let lostCount = 0;
    let pendingCount = 0;

    // Count tickets regardless of their status for display purposes
    tickets.forEach((ticket) => {
      const stake = parseFloat(ticket.stake);
      const status = ticket.status || "pending";

      if (status === "won") {
        wonCount++;
      } else if (status === "lost") {
        lostCount++;
      } else {
        pendingCount++;
      }

      totalStaked += stake;
    });

    // For custom leagues, use REAL budget data
    let netProfit = 0;
    if (leagueId && getCustomLeagueBudget) {
      const budgetData = getCustomLeagueBudget(leagueId);
      netProfit = budgetData.profit || 0;
    } else {
      // Fallback to calculating from tickets for non-custom leagues
      let totalWon = 0;
      let totalLost = 0;

      tickets.forEach((ticket) => {
        const stake = parseFloat(ticket.stake);
        const potentialWin = parseFloat(ticket.potentialWin);
        const status = ticket.status || "pending";

        if (status === "won") {
          totalWon += potentialWin - stake;
        } else if (status === "lost") {
          totalLost += stake;
        } else if (status === "pending") {
          totalLost += stake; // Oduzmi stake i za pending
        }
      });

      netProfit = totalWon - totalLost;
    }

    const roi = totalStaked > 0 ? ((netProfit / totalStaked) * 100).toFixed(2) : 0;
    const winRate = wonCount + lostCount > 0 ? ((wonCount / (wonCount + lostCount)) * 100).toFixed(1) : 0;

    return {
      totalStaked: totalStaked.toFixed(2),
      netProfit: netProfit.toFixed(2),
      roi,
      winRate,
      wonCount,
      lostCount,
      pendingCount,
      totalTickets: tickets.length,
    };
  };

  const stats = calculateStats();
  const isProfitable = parseFloat(stats.netProfit) >= 0;

  return (
    <div className="profit-stats">
      <div className="stats-grid">
        {/* Net Profit */}
        <div className={`stat-card ${isProfitable ? "profit" : "loss"}`}>
          <div className="stat-icon">
            {isProfitable ? (
              <TrendingUp size={24} />
            ) : (
              <TrendingDown size={24} />
            )}
          </div>
          <div className="stat-content">
            <div className="stat-label">Net Profit</div>
            <div className="stat-value">
              {isProfitable ? "+" : ""}
              {stats.netProfit}%
            </div>
          </div>
        </div>

        {/* Total Staked */}
        <div className="stat-card">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Staked</div>
            <div className="stat-value">{stats.totalStaked}%</div>
          </div>
        </div>

        {/* Win Rate */}
        <div className="stat-card">
          <div className="stat-icon">
            <Target size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Win Rate</div>
            <div className="stat-value">{stats.winRate}%</div>
          </div>
        </div>

        {/* ROI */}
        <div className="stat-card">
          <div className="stat-icon roi">
            <span>ROI</span>
          </div>
          <div className="stat-content">
            <div className="stat-label">Return on Investment</div>
            <div className="stat-value">{stats.roi}%</div>
          </div>
        </div>
      </div>

      {/* Ticket Summary */}
      <div className="tickets-summary">
        <div className="summary-item won">
          <span className="summary-label">Won</span>
          <span className="summary-value">{stats.wonCount}</span>
        </div>
        <div className="summary-item lost">
          <span className="summary-label">Lost</span>
          <span className="summary-value">{stats.lostCount}</span>
        </div>
        <div className="summary-item pending">
          <span className="summary-label">Pending</span>
          <span className="summary-value">{stats.pendingCount}</span>
        </div>
        <div className="summary-item total">
          <span className="summary-label">Total</span>
          <span className="summary-value">{stats.totalTickets}</span>
        </div>
      </div>
    </div>
  );
};

export default RealProfitStats;