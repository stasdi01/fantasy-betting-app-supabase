import React from "react";
import { X, Trophy, TrendingUp, Target } from "lucide-react";
import "../../styles/GroupDetails.css";

const GroupDetails = ({ group, onClose, onLeaveGroup }) => {
  if (!group) return null;

  // Sortiraj članove po profitu
  const sortedMembers = [...group.members].sort(
    (a, b) => b.totalProfit - a.totalProfit
  );

  const getRankIcon = (position) => {
    switch (position) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return null;
    }
  };

  const getRankClass = (position) => {
    if (position <= 3) return `rank-${position}`;
    return "";
  };

  // Funkcija za napuštanje grupe
  const handleLeaveGroup = () => {
    if (window.confirm(`Are you sure you want to leave "${group.name}"?`)) {
      onLeaveGroup(group.id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="group-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{group.name}</h2>
            <p>{group.description}</p>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="leaderboard-section">
          <h3>Group Leaderboard</h3>

          <div className="leaderboard-header">
            <div className="header-rank">Rank</div>
            <div className="header-player">Player</div>
            <div className="header-profit">Profit</div>
            <div className="header-winrate">Win Rate</div>
            <div className="header-bets">Bets</div>
          </div>

          <div className="leaderboard-list">
            {sortedMembers.map((member, index) => (
              <div
                key={member.id}
                className={`leaderboard-item ${getRankClass(index + 1)}`}
              >
                <div className="rank">
                  <span className="rank-number">#{index + 1}</span>
                  {getRankIcon(index + 1)}
                </div>

                <div className="player">
                  <span className="player-avatar">{member.avatar}</span>
                  <span className="player-name">{member.username}</span>
                </div>

                <div className="profit">
                  <span
                    className={
                      member.totalProfit >= 0 ? "positive" : "negative"
                    }
                  >
                    {member.totalProfit >= 0 ? "+" : ""}
                    {member.totalProfit.toFixed(2)}%
                  </span>
                </div>

                <div className="winrate">
                  <div className="winrate-bar">
                    <div
                      className="winrate-fill"
                      style={{ width: `${member.winRate}%` }}
                    ></div>
                  </div>
                  <span>{member.winRate}%</span>
                </div>

                <div className="bets">{member.totalBets}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="group-actions">
          {group.isJoined ? (
            <button className="leave-button" onClick={handleLeaveGroup}>
              Leave Group
            </button>
          ) : (
            <button
              className="join-button"
              onClick={() => {
                onLeaveGroup(group.id); // Ovo će zapravo biti join
                onClose();
              }}
            >
              Join Group
            </button>
          )}
          <button
            className="invite-button"
            onClick={() => alert("Invite feature coming soon!")}
          >
            Invite Friends
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;
