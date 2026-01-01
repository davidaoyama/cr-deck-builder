import React, { useState } from 'react';
import '../styles/PlayerSearch.css';

function PlayerSearch({ onSearch, loading }) {
  const [playerTag, setPlayerTag] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (playerTag.trim()) {
      const tag = playerTag.startsWith('#') ? playerTag : `#${playerTag}`;
      
      try {
        // Call backend /api/sync endpoint
        const response = await fetch('http://localhost:3001/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerTag: tag,
            userId: 'temp-user-' + Date.now() // Temporary userId
          })
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to fetch player');
          return;
        }

        console.log('✅ Player synced:', data.snapshot);
        onSearch(tag, data.snapshot);
      } catch (error) {
        console.error('Network error:', error);
        setError(error.message || 'Network error');
      }
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <h2>🔍 Find Your Player</h2>
        
        <div className="search-input-group">
          <input
            type="text"
            value={playerTag}
            onChange={(e) => setPlayerTag(e.target.value)}
            placeholder="Enter player tag (e.g., 2P8888R8U)"
            className="search-input"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !playerTag.trim()}
            className="search-button"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {error && (
          <div className="search-error">
            <p>❌ {error}</p>
          </div>
        )}

        <p className="search-tip">
          💡 Tip: Find your player tag in Clash Royale by tapping your profile → the tag appears below your name
        </p>
      </form>
    </div>
  );
}

export default PlayerSearch;
