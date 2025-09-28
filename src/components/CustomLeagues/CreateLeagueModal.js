import React, { useState } from 'react';
import { X, Users, Lock, Unlock, Trophy, Target } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../Toast/ToastProvider';
import LoadingSpinner from '../Loading/LoadingSpinner';
import '../../styles/CreateLeagueModal.css';

const CreateLeagueModal = ({ isOpen, onClose, onLeagueCreated, maxLeagues, maxMembers }) => {
  const { profile } = useAuth();
  const { success, error: showError } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    league_type: 'bet', // 'bet' or 'myteam'
    is_public: true,
    max_members: maxMembers || 10,
    min_members: 2,
    entry_fee: 0,
    rules: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'League name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'League name must be at least 3 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'League name must be less than 50 characters';
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }

    if (formData.max_members < formData.min_members) {
      newErrors.max_members = 'Maximum members must be greater than minimum members';
    }

    if (formData.min_members < 2) {
      newErrors.min_members = 'Minimum members must be at least 2';
    }

    if (formData.max_members > maxMembers) {
      newErrors.max_members = `Maximum members cannot exceed ${maxMembers} for your subscription`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await onLeagueCreated(formData);

      success(`League "${formData.name}" created successfully!`);

      // Reset form
      setFormData({
        name: '',
        description: '',
        league_type: 'bet',
        is_public: true,
        max_members: maxMembers || 10,
        min_members: 2,
        entry_fee: 0,
        rules: ''
      });

      onClose();
    } catch (error) {
      console.error('Create league error:', error);
      showError(error.message || 'Failed to create league');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Custom League</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-league-form">
          {/* League Name */}
          <div className="form-group">
            <label htmlFor="name">League Name *</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter league name"
              className={errors.name ? 'error' : ''}
              disabled={loading}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe your league (optional)"
              rows={3}
              className={errors.description ? 'error' : ''}
              disabled={loading}
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          {/* League Type */}
          <div className="form-group">
            <label>League Type</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="league_type"
                  value="bet"
                  checked={formData.league_type === 'bet'}
                  onChange={(e) => handleChange('league_type', e.target.value)}
                  disabled={loading}
                />
                <Trophy size={18} />
                <span>BetLeague</span>
                <small>Match prediction competitions</small>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="league_type"
                  value="myteam"
                  checked={formData.league_type === 'myteam'}
                  onChange={(e) => handleChange('league_type', e.target.value)}
                  disabled={loading}
                />
                <Target size={18} />
                <span>MyTeam League</span>
                <small>Fantasy team competitions</small>
              </label>
            </div>
          </div>

          {/* Privacy */}
          <div className="form-group">
            <label>Privacy</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="is_public"
                  value={true}
                  checked={formData.is_public === true}
                  onChange={() => handleChange('is_public', true)}
                  disabled={loading}
                />
                <Unlock size={18} />
                <span>Public</span>
                <small>Anyone can find and join</small>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="is_public"
                  value={false}
                  checked={formData.is_public === false}
                  onChange={() => handleChange('is_public', false)}
                  disabled={loading}
                />
                <Lock size={18} />
                <span>Private</span>
                <small>Invite-only league</small>
              </label>
            </div>
          </div>

          {/* Member Limits */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="min_members">Min Members</label>
              <input
                id="min_members"
                type="number"
                min="2"
                max={formData.max_members}
                value={formData.min_members}
                onChange={(e) => handleChange('min_members', parseInt(e.target.value))}
                className={errors.min_members ? 'error' : ''}
                disabled={loading}
              />
              {errors.min_members && <span className="error-text">{errors.min_members}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="max_members">Max Members</label>
              <input
                id="max_members"
                type="number"
                min={formData.min_members}
                max={maxMembers}
                value={formData.max_members}
                onChange={(e) => handleChange('max_members', parseInt(e.target.value))}
                className={errors.max_members ? 'error' : ''}
                disabled={loading}
              />
              {errors.max_members && <span className="error-text">{errors.max_members}</span>}
              <small>Your plan allows up to {maxMembers} members</small>
            </div>
          </div>

          {/* Rules (MAX users only) */}
          {profile?.role === 'max' && (
            <div className="form-group">
              <label htmlFor="rules">Custom Rules</label>
              <textarea
                id="rules"
                value={formData.rules}
                onChange={(e) => handleChange('rules', e.target.value)}
                placeholder="Define any special rules for your league (optional)"
                rows={3}
                disabled={loading}
              />
              <small>MAX users can customize league rules</small>
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
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
                <>
                  <LoadingSpinner size="sm" color="white" />
                  Creating...
                </>
              ) : (
                <>
                  <Users size={18} />
                  Create League
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLeagueModal;