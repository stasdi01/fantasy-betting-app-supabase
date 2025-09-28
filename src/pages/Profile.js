import React, { useState } from "react";
import { User, Mail, Crown, Calendar, Save, Edit3 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast/ToastProvider";
import LoadingSpinner from "../components/Loading/LoadingSpinner";
import { validateForm, profileValidationRules } from "../utils/validation";
import "../styles/Profile.css";

const Profile = () => {
  const { profile, updateProfile, isPremium } = useAuth();
  const { success, error: showError } = useToast();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: profile?.username || "",
    email: profile?.email || ""
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validation = validateForm(formData, profileValidationRules);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setLoading(true);
    setFieldErrors({});

    try {
      const { error } = await updateProfile({
        username: formData.username,
        email: formData.email
      });

      if (error) {
        showError(error.message || "Failed to update profile");
      } else {
        success("Profile updated successfully!");
        setEditing(false);
      }
    } catch (error) {
      showError("An error occurred while updating profile");
    }

    setLoading(false);
  };

  const handleCancel = () => {
    setFormData({
      username: profile?.username || "",
      email: profile?.email || ""
    });
    setFieldErrors({});
    setEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile Settings</h1>
        <p>Manage your account information and preferences</p>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-info">
            <div className="user-avatar">
              <User size={48} />
            </div>
            <div className="user-details">
              <h2>
                {profile?.username}
                {isPremium && <Crown size={20} className="premium-icon" />}
              </h2>
              <p className="user-role">
                {isPremium ? "Premium Member" : "Free Member"}
              </p>
              {isPremium && profile?.premium_expires_at && (
                <p className="premium-expires">
                  Premium expires: {formatDate(profile.premium_expires_at)}
                </p>
              )}
            </div>
            <button
              className="edit-button"
              onClick={() => setEditing(!editing)}
              disabled={loading}
            >
              <Edit3 size={16} />
              {editing ? "Cancel" : "Edit"}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label>
                  <User size={16} />
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={fieldErrors.username ? "error" : ""}
                  disabled={loading}
                />
                {fieldErrors.username && (
                  <div className="field-error">{fieldErrors.username}</div>
                )}
              </div>

              <div className="form-group">
                <label>
                  <Mail size={16} />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={fieldErrors.email ? "error" : ""}
                  disabled={loading}
                />
                {fieldErrors.email && (
                  <div className="field-error">{fieldErrors.email}</div>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-display">
              <div className="info-group">
                <label>
                  <User size={16} />
                  Username
                </label>
                <span>{profile?.username}</span>
              </div>

              <div className="info-group">
                <label>
                  <Mail size={16} />
                  Email
                </label>
                <span>{profile?.email}</span>
              </div>

              <div className="info-group">
                <label>
                  <Calendar size={16} />
                  Member Since
                </label>
                <span>{formatDate(profile?.created_at)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Account Statistics */}
        <div className="stats-card">
          <h3>Account Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Account Type</span>
              <span className="stat-value">
                {isPremium ? "Premium" : "Free"}
                {isPremium && <Crown size={14} />}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Member Since</span>
              <span className="stat-value">{formatDate(profile?.created_at)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Last Updated</span>
              <span className="stat-value">{formatDate(profile?.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;