import React from "react";
import { Users, Trophy, Calendar, ChevronRight } from "lucide-react";
import { mockUsers } from "../../data/groupsData";
import "../../styles/GroupCard.css";

const GroupCard = ({ group, onViewDetails, onJoinGroup, currentUser }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Pronađi rang trenutnog korisnika u grupi
  const getUserRank = () => {
    if (!group.isJoined) return null;

    // Sortiraj članove po profitu
    const sortedMembers = [...group.members].sort(
      (a, b) => b.totalProfit - a.totalProfit
    );

    // Za sada, pretpostavi da je trenutni korisnik prvi član
    // Kasnije ćemo ovo povezati sa pravim korisnikom
    const userIndex = sortedMembers.findIndex((m) => m.id === mockUsers[0].id);

    if (userIndex !== -1) {
      return `#${userIndex + 1}`;
    }
    return null;
  };

  const userRank = getUserRank();

  return (
    <div className={`group-card ${group.isJoined ? "joined" : ""}`}>
      <div className="group-header">
        <div className="group-info">
          <h3>{group.name}</h3>
          <p className="group-description">{group.description}</p>
        </div>
        {group.isJoined && userRank && (
          <div className="user-rank">
            <Trophy size={16} />
            <span>Your Rank: {userRank}</span>
          </div>
        )}
      </div>

      <div className="group-stats">
        <div className="stat">
          <Users size={16} />
          <span>{group.memberCount} members</span>
        </div>
        <div className="stat">
          <Calendar size={16} />
          <span>Created {formatDate(group.created)}</span>
        </div>
      </div>

      <div className="group-footer">
        {group.isJoined ? (
          <button className="view-button" onClick={() => onViewDetails(group)}>
            View Details
            <ChevronRight size={16} />
          </button>
        ) : (
          <button className="join-button" onClick={() => onJoinGroup(group.id)}>
            Join Group
          </button>
        )}
      </div>
    </div>
  );
};

export default GroupCard;
