import React from 'react';
import { Trophy } from 'lucide-react';

const PublicLeague = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <Trophy size={64} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
      <h1>Public League</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Compete in free public leagues that all users automatically join when they register.
      </p>
      <div style={{
        background: 'var(--bg-secondary)',
        padding: '2rem',
        borderRadius: '12px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h3>Two Free Leagues</h3>
        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          <div style={{
            background: 'var(--bg-primary)',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid var(--border)'
          }}>
            <h4>🎯 BetLeague</h4>
            <p>Predict match outcomes and compete in monthly competitions with Bronze → Diamond ranking system.</p>
          </div>
          <div style={{
            background: 'var(--bg-primary)',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid var(--border)'
          }}>
            <h4>⭐ MyTeam League</h4>
            <p>Build fantasy teams and predict player performances in season-long EuroLeague competition.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicLeague;