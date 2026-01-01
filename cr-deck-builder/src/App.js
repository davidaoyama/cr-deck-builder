import React, { useState } from 'react';
import './App.css';
import PlayerSearch from './components/PlayerSearch';
import PlayerCards from './components/PlayerCards';

function App() {
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePlayerSearch = (playerTag, snapshot) => {
    // Called from PlayerSearch with the synced snapshot from backend
    setPlayerData(snapshot);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>⚔️ Clash Royale Deck Builder</h1>
          <p>Find decks you can actually build with your card levels</p>
        </div>
      </header>

      <main className="app-main">
        <div className="search-section">
          <PlayerSearch onSearch={handlePlayerSearch} loading={loading} />
        </div>

        {playerData && !loading && (
          <div className="player-info">
            <h2>✅ Player Found!</h2>
            <div className="player-details">
              <p><strong>Name:</strong> {playerData.player_name}</p>
              <p><strong>Tag:</strong> {playerData.player_tag}</p>
            </div>
          </div>
        )}

        {playerData && !loading && <PlayerCards playerData={playerData} />}

        {!playerData && !loading && (
          <div className="empty-state">
            <p>Enter your player tag above to get started</p>
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
