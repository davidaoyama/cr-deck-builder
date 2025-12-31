import React, { useState } from 'react';
import './App.css';
import PlayerSearch from './components/PlayerSearch';
import PlayerCards from './components/PlayerCards';

function App() {
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePlayerSearch = async (playerTag) => {
    setLoading(true);
    setError(null);
    setPlayerData(null);

    try {
      // Using the Clash Royale API
      const response = await fetch(
        `https://api.clashroyale.com/v1/players/${encodeURIComponent(playerTag)}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_CR_API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Player not found. Please check your player tag.');
      }

      const data = await response.json();
      setPlayerData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

        {error && (
          <div className="error-message">
            <p>❌ Error: {error}</p>
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        )}

        {playerData && !loading && <PlayerCards playerData={playerData} />}

        {!playerData && !loading && !error && (
          <div className="empty-state">
            <p>Enter your player tag above to get started</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
