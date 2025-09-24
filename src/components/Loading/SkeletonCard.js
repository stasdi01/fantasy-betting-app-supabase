import './LoadingSpinner.css';

const SkeletonCard = ({ type = 'ticket' }) => {
  if (type === 'ticket') {
    return (
      <div className="skeleton-card">
        <div className="loading-skeleton skeleton-line medium"></div>
        <div className="loading-skeleton skeleton-line short"></div>
        <div className="loading-skeleton skeleton-line long"></div>
        <div className="loading-skeleton skeleton-line short"></div>
      </div>
    );
  }

  if (type === 'match') {
    return (
      <div className="skeleton-card">
        <div className="loading-skeleton skeleton-line long"></div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
          <div className="loading-skeleton skeleton-line medium"></div>
          <div className="loading-skeleton skeleton-line short"></div>
          <div className="loading-skeleton skeleton-line medium"></div>
        </div>
      </div>
    );
  }

  if (type === 'stats') {
    return (
      <div className="skeleton-card">
        <div className="loading-skeleton skeleton-line short"></div>
        <div className="loading-skeleton skeleton-line medium"></div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
          <div className="loading-skeleton skeleton-line short"></div>
          <div className="loading-skeleton skeleton-line short"></div>
          <div className="loading-skeleton skeleton-line short"></div>
        </div>
      </div>
    );
  }

  if (type === 'leaderboard') {
    return (
      <div className="skeleton-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="loading-skeleton skeleton-avatar"></div>
          <div style={{ flex: 1 }}>
            <div className="loading-skeleton skeleton-line medium"></div>
            <div className="loading-skeleton skeleton-line short"></div>
          </div>
          <div className="loading-skeleton skeleton-line short"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="skeleton-card">
      <div className="loading-skeleton skeleton-line long"></div>
      <div className="loading-skeleton skeleton-line medium"></div>
      <div className="loading-skeleton skeleton-line short"></div>
    </div>
  );
};

export default SkeletonCard;