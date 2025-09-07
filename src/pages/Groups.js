import CreateGroupModal from "../components/Groups/CreateGroupModal";
import React, { useState, useEffect } from "react";
import { Plus, Search, Users } from "lucide-react";
import GroupCard from "../components/Groups/GroupCard";
import GroupDetails from "../components/Groups/GroupDetails";
import { mockGroups } from "../data/groupsData";
import "../styles/Groups.css";

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Učitaj grupe iz localStorage ili koristi mock podatke
    const savedGroups = localStorage.getItem("userGroups");
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups));
    } else {
      setGroups(mockGroups);
      localStorage.setItem("userGroups", JSON.stringify(mockGroups));
    }
  }, []);

  const handleViewDetails = (group) => {
    setSelectedGroup(group);
  };

  const handleCloseDetails = () => {
    setSelectedGroup(null);
  };

  const handleCreateGroup = (newGroup) => {
    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    localStorage.setItem("userGroups", JSON.stringify(updatedGroups));
  };

  const handleLeaveGroup = (groupId) => {
    const updatedGroups = groups.map((group) => {
      if (group.id === groupId) {
        return {
          ...group,
          isJoined: false,
          memberCount: group.memberCount - 1,
          // Ukloni trenutnog korisnika iz članova
          members: group.members.slice(1),
        };
      }
      return group;
    });

    setGroups(updatedGroups);
    localStorage.setItem("userGroups", JSON.stringify(updatedGroups));
  };

  const handleJoinGroup = (groupId) => {
    const updatedGroups = groups.map((group) => {
      if (group.id === groupId) {
        // Dodaj trenutnog korisnika u grupu
        const currentUserData = {
          id: 999, // Jedinstveni ID za trenutnog korisnika
          username: "You", // Ili koristi pravo ime iz login-a
          totalProfit: 0,
          winRate: 0,
          totalBets: 0,
          avatar: "🎮",
        };

        return {
          ...group,
          isJoined: true,
          memberCount: group.memberCount + 1,
          members: [...group.members, currentUserData],
        };
      }
      return group;
    });

    setGroups(updatedGroups);
    localStorage.setItem("userGroups", JSON.stringify(updatedGroups));
  };

  // Filtriraj grupe po search termu
  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Podeli grupe na joined i available
  const joinedGroups = filteredGroups.filter((g) => g.isJoined);
  const availableGroups = filteredGroups.filter((g) => !g.isJoined);

  return (
    <div className="groups-container">
      {/* Header */}
      <div className="groups-header">
        <div className="header-content">
          <h1>Groups & Competitions</h1>
          <p>Compete with friends and climb the leaderboard</p>
        </div>

        {/* Actions Bar */}
        <div className="actions-bar">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            className="create-button"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={18} />
            Create Group
          </button>
        </div>
      </div>

      {/* My Groups Section */}
      {joinedGroups.length > 0 && (
        <div className="groups-section">
          <div className="section-title">
            <Users size={20} />
            <h2>My Groups</h2>
            <span className="group-count">{joinedGroups.length}</span>
          </div>

          <div className="groups-grid">
            {joinedGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onViewDetails={handleViewDetails}
                onJoinGroup={handleJoinGroup}
              />
            ))}
          </div>
        </div>
      )}

      {/* Available Groups Section */}
      {availableGroups.length > 0 && (
        <div className="groups-section">
          <div className="section-title">
            <h2>Discover Groups</h2>
            <span className="group-count">{availableGroups.length}</span>
          </div>

          <div className="groups-grid">
            {availableGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onViewDetails={handleViewDetails}
                onJoinGroup={handleJoinGroup}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredGroups.length === 0 && (
        <div className="empty-state">
          <Users size={48} />
          <h3>No groups found</h3>
          <p>
            {searchTerm
              ? "Try adjusting your search"
              : "Create your first group or join existing ones"}
          </p>
        </div>
      )}

      {/* Group Details Modal */}
      {selectedGroup && (
        <GroupDetails
          group={selectedGroup}
          onClose={handleCloseDetails}
          onLeaveGroup={handleLeaveGroup}
        />
      )}
      {/* Create Group Modal */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onCreateGroup={handleCreateGroup}
        />
      )}
    </div>
  );
};

export default Groups;
