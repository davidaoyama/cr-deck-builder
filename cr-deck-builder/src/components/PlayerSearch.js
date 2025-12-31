import React, { useState } from 'react';
import '../styles/PlayerSearch.css';

function PlayerSearch({ onSearch, loading }) {
  const [playerTag, setPlayerTag] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (playerTag.trim()) {
      const tag = playerTag.startsWith('#') ? playerTag : `#${playerTag}`;
      onSearch(tag);
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

        <p className="search-tip">
          💡 Tip: Find your player tag in Clash Royale by tapping your profile → the tag appears below your name
        </p>
      </form>
    </div>
  );
}

export default PlayerSearch;
