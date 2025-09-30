import React from 'react';
import { BookOpen, Target, Trophy, TrendingUp, Users, Crown, Shield, Calculator, Star, Award } from 'lucide-react';
import '../styles/Rules.css';

const Rules = () => {
  return (
    <div className="rules-container">
      {/* Header */}
      <div className="rules-header">
        <div className="header-background">
          <div className="gradient-circle circle-1"></div>
          <div className="gradient-circle circle-2"></div>
          <div className="gradient-circle circle-3"></div>
        </div>

        <div className="header-content">
          <div className="title-section">
            <div className="icon-wrapper">
              <BookOpen size={40} className="main-icon" />
            </div>
            <div className="title-text">
              <h1>Rules & How to Play</h1>
              <p>Everything you need to know about DreamStakes - the ultimate sports prediction platform</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="rules-content">

        {/* Game Overview */}
        <section className="rules-section">
          <div className="section-header">
            <Target size={24} />
            <h2>Game Overview</h2>
          </div>
          <div className="section-content">
            <p>
              DreamStakes is a sports prediction platform where you compete against other users by making predictions on football matches.
              Your success is measured by virtual percentage-based profits, not real money. The goal is to achieve the highest profit
              percentage through accurate predictions and smart betting strategies.
            </p>
          </div>
        </section>

        {/* Budget System */}
        <section className="rules-section">
          <div className="section-header">
            <Calculator size={24} />
            <h2>Budget & Profit System</h2>
          </div>
          <div className="section-content">
            <div className="rule-item">
              <h3>Virtual Percentage Budget</h3>
              <p>
                Every user starts with a virtual 100% budget. Your profits and losses are calculated as percentages,
                not real money. For example, if you bet 10% on odds of 2.00 and win, you gain +10% profit (20% - 10% stake = 10% profit).
              </p>
            </div>
            <div className="rule-item">
              <h3>Profit Calculation</h3>
              <ul>
                <li><strong>Win:</strong> Profit = (Stake × Odds) - Stake</li>
                <li><strong>Loss:</strong> Loss = -Stake amount</li>
                <li><strong>Example:</strong> Bet 10% on 2.00 odds → Win = +10% profit, Loss = -10%</li>
              </ul>
            </div>
            <div className="rule-item">
              <h3>Blocking System</h3>
              <p>
                If your total profit reaches -100%, you will be blocked from making new predictions until the next period.
                This prevents unlimited losses and encourages responsible betting strategies.
              </p>
            </div>
          </div>
        </section>

        {/* Game Modes */}
        <section className="rules-section">
          <div className="section-header">
            <Trophy size={24} />
            <h2>Game Modes</h2>
          </div>
          <div className="section-content">
            <div className="game-mode">
              <div className="mode-header">
                <Trophy size={20} />
                <h3>BetLeague (Monthly Competition)</h3>
              </div>
              <ul>
                <li>Monthly competitions with rank-based tiers: Bronze, Silver, Gold, Platinum, Diamond</li>
                <li>Make predictions on football matches from major leagues</li>
                <li>Budget resets every month</li>
                <li>Compete for top positions on the monthly leaderboard</li>
              </ul>
            </div>

            <div className="game-mode">
              <div className="mode-header">
                <Target size={20} />
                <h3>MyTeam League (Season Competition)</h3>
              </div>
              <ul>
                <li>Fantasy-style competition based on player performance predictions</li>
                <li>Build teams with players from different leagues</li>
                <li>Budget tracking per round/gameweek</li>
                <li>Season-long competition with multiple teams allowed (PRO/MAX users)</li>
              </ul>
            </div>

            <div className="game-mode">
              <div className="mode-header">
                <Users size={20} />
                <h3>Custom Leagues (Your Leagues)</h3>
              </div>
              <ul>
                <li>Create private leagues with friends (PRO/MAX feature)</li>
                <li>Set custom rules and participation limits</li>
                <li>Track separate budgets for each custom league</li>
                <li>Invite specific users to compete in closed groups</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Subscription Tiers */}
        <section className="rules-section">
          <div className="section-header">
            <Crown size={24} />
            <h2>Subscription Tiers</h2>
          </div>
          <div className="section-content">
            <div className="tier">
              <div className="tier-header free">
                <span className="tier-name">FREE</span>
              </div>
              <ul>
                <li>Access to BetLeague and MyTeam competitions</li>
                <li>7-day betting history</li>
                <li>Basic profit tracking</li>
                <li>Public league participation only</li>
              </ul>
            </div>

            <div className="tier">
              <div className="tier-header pro">
                <Star size={16} />
                <span className="tier-name">PRO ($5/month)</span>
              </div>
              <ul>
                <li>Everything in FREE</li>
                <li>Full betting history access</li>
                <li>Create up to 2 custom leagues (max 10 users each)</li>
                <li>Up to 3 teams per MyTeam league</li>
                <li>Premium badge display</li>
              </ul>
            </div>

            <div className="tier">
              <div className="tier-header max">
                <Crown size={16} />
                <span className="tier-name">MAX ($10/month)</span>
              </div>
              <ul>
                <li>Everything in PRO</li>
                <li>Unlimited custom leagues (max 100 users each)</li>
                <li>VIP Team access - see top performers' predictions</li>
                <li>Unlimited teams per MyTeam league</li>
                <li>Priority support and early access to new features</li>
              </ul>
            </div>
          </div>
        </section>

        {/* VIP Team */}
        <section className="rules-section">
          <div className="section-header">
            <Shield size={24} />
            <h2>VIP Team (MAX Exclusive)</h2>
          </div>
          <div className="section-content">
            <p>
              VIP Team gives MAX subscribers exclusive access to the Hall of Fame - the top 10 highest-performing users
              across all competitions. You can see their live predictions, track their betting patterns, and learn from
              proven winners' strategies in real-time.
            </p>
          </div>
        </section>

        {/* Leaderboards & Rankings */}
        <section className="rules-section">
          <div className="section-header">
            <Award size={24} />
            <h2>Leaderboards & Rankings</h2>
          </div>
          <div className="section-content">
            <div className="rule-item">
              <h3>All-Time Leaderboard</h3>
              <p>
                Global ranking of the best performers across all time periods and competitions.
                Features the top 10 users who have achieved the highest cumulative profits.
              </p>
            </div>
            <div className="rule-item">
              <h3>Monthly BetLeague Rankings</h3>
              <p>
                Ranked tiers based on monthly performance: Bronze, Silver, Gold, Platinum, Diamond.
                Your tier determines your status and recognition within the community.
              </p>
            </div>
            <div className="rule-item">
              <h3>MyTeam Seasonal Rankings</h3>
              <p>
                Season-long competition rankings based on fantasy team performance and player prediction accuracy.
              </p>
            </div>
          </div>
        </section>

        {/* Tips for Success */}
        <section className="rules-section">
          <div className="section-header">
            <TrendingUp size={24} />
            <h2>Tips for Success</h2>
          </div>
          <div className="section-content">
            <div className="tips-grid">
              <div className="tip-card">
                <h4>🎯 Start Small</h4>
                <p>Begin with smaller stake percentages (1-5%) to learn the system and minimize early losses.</p>
              </div>
              <div className="tip-card">
                <h4>📊 Study Odds</h4>
                <p>Higher odds mean higher risk. Balance high-odds picks with safer, lower-odds predictions.</p>
              </div>
              <div className="tip-card">
                <h4>🏆 Follow Top Players</h4>
                <p>Watch the leaderboard and learn from successful users' strategies and patterns.</p>
              </div>
              <div className="tip-card">
                <h4>⚡ Manage Risk</h4>
                <p>Never bet your entire budget on single predictions. Diversify across multiple matches.</p>
              </div>
              <div className="tip-card">
                <h4>📈 Track Performance</h4>
                <p>Use the Profit page to analyze your betting history and identify successful patterns.</p>
              </div>
              <div className="tip-card">
                <h4>🎮 Stay Consistent</h4>
                <p>Regular participation and consistent strategy often outperform sporadic big bets.</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Rules;