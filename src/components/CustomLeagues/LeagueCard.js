import React, { useState } from 'react';
import { Users, Crown, Lock, Unlock, Trophy, Target, Trash2, LogOut, UserPlus, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../Toast/ToastProvider';
import { useConfirm } from '../Toast/ConfirmDialog';
import LoadingSpinner from '../Loading/LoadingSpinner';
import '../../styles/LeagueCard.css';

const LeagueCard = ({ league, isOwner = false, isMember = false, onJoin, onLeave, onDelete }) => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const { confirm } = useConfirm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const memberCount = league.league_memberships?.[0]?.count || 0;
  const isPublic = league.is_public;
  const isFull = memberCount >= league.max_members;

  const getLeagueTypeIcon = () => {
    return league.league_type === 'myteam' ? <Target size={18} /> : <Trophy size={18} />;
  };

  const getLeagueTypeLabel = () => {
    return league.league_type === 'myteam' ? 'MyTeam League' : 'BetLeague';
  };

  const handleJoin = async () => {
    if (!onJoin) return;

    setLoading(true);
    try {
      await onJoin(league.id);
      success(`Successfully joined "${league.name}"!`);
    } catch (error) {
      showError(error.message || 'Failed to join league');
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!onLeave) return;

    const confirmed = await confirm({
      title: 'Leave League',
      message: `Are you sure you want to leave "${league.name}"? You can rejoin later if it's public.`,
      type: 'warning'
    });

    if (!confirmed) return;

    setLoading(true);
    try {
      await onLeave(league.id);
      success(`Left "${league.name}" successfully`);
    } catch (error) {
      showError(error.message || 'Failed to leave league');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    const confirmed = await confirm({
      title: 'Delete League',
      message: `Are you sure you want to delete "${league.name}"? This action cannot be undone and all members will be removed.`,
      type: 'danger'
    });

    if (!confirmed) return;

    setLoading(true);
    try {
      await onDelete(league.id);
      success(`"${league.name}" deleted successfully`);
    } catch (error) {
      showError(error.message || 'Failed to delete league');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`league-card ${isOwner ? 'owner' : ''} ${isMember ? 'member' : ''}`}>
      <div className="league-header">
        <div className="league-info">
          <div className="league-name">
            {getLeagueTypeIcon()}
            <h3>{league.name}</h3>
            {isOwner && <Crown size={16} className="owner-badge" />}
            {isPublic ? <Unlock size={14} className="privacy-icon" /> : <Lock size={14} className="privacy-icon" />}
          </div>
          <div className="league-type">
            {getLeagueTypeLabel()}
          </div>
        </div>

        <div className="league-status">
          <div className="member-count">
            <Users size={16} />
            <span>{memberCount}/{league.max_members}</span>
          </div>
          {isFull && <span className="full-badge">Full</span>}
        </div>
      </div>

      {league.description && (
        <div className="league-description">
          <p>{league.description}</p>
        </div>
      )}

      <div className="league-details">
        <div className="detail-item">
          <span className="label">Created:</span>
          <span className="value">{formatDate(league.created_at)}</span>
        </div>
        <div className="detail-item">
          <span className="label">Creator:</span>
          <span className="value">{league.users?.username || 'Unknown'}</span>
        </div>
        {league.rules && (
          <div className="detail-item rules">
            <span className="label">Rules:</span>
            <span className="value">{league.rules}</span>
          </div>
        )}
      </div>

      <div className="league-actions">
        {loading ? (
          <div className="loading-actions">
            <LoadingSpinner size="sm" />
          </div>
        ) : (
          <>
            {/* Show View button for members, owners, and public leagues */}
            {(isMember || isOwner || league.is_public) && (
              <button
                onClick={() => navigate(`/league/${league.id}`)}
                className="action-btn view"
              >
                <Eye size={16} />
                {isMember || isOwner ? 'View League' : 'View & Join'}
              </button>
            )}

            {isOwner ? (
              <button
                onClick={handleDelete}
                className="action-btn delete"
                disabled={loading}
              >
                <Trash2 size={16} />
                Delete
              </button>
            ) : isMember ? (
              <button
                onClick={handleLeave}
                className="action-btn leave"
                disabled={loading}
              >
                <LogOut size={16} />
                Leave
              </button>
            ) : (
              <button
                onClick={handleJoin}
                className="action-btn join"
                disabled={loading || isFull}
              >
                <UserPlus size={16} />
                {isFull ? 'League Full' : 'Join League'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LeagueCard;