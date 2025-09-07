import React, { useState } from "react";
import { X, Users } from "lucide-react";
import "../../styles/CreateGroupModal.css";

const CreateGroupModal = ({ onClose, onCreateGroup }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.description) {
      const newGroup = {
        id: Date.now(),
        name: formData.name,
        description: formData.description,
        memberCount: 1,
        created: new Date().toISOString(),
        isJoined: true,
        members: [], // Dodaćemo trenutnog korisnika
      };
      onCreateGroup(newGroup);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-group-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Group</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-group-form">
          <div className="form-group">
            <label>Group Name</label>
            <input
              type="text"
              placeholder="Enter group name..."
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              maxLength={30}
              required
            />
            <span className="char-count">{formData.name.length}/30</span>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="What's this group about?"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              maxLength={100}
              rows={3}
              required
            />
            <span className="char-count">
              {formData.description.length}/100
            </span>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button">
              <Users size={18} />
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
