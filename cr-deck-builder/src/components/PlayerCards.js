import React, { useMemo } from 'react';
import '../styles/PlayerCards.css';

function PlayerCards({ playerData }) {
  const cardsByType = useMemo(() => {
    if (!playerData.cards) return {};

    const grouped = {};
    playerData.cards.forEach((card) => {
      const type = card.rarity || 'Unknown';
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(card);
    });

    return grouped;
  }, [playerData.cards]);

  const rarityOrder = ['Legendary', 'Epic', 'Rare', 'Common'];

  return (
    <div className="player-cards-container">
      <div className="player-info">
        <div className="player-header">
          <div>
            <h2>{playerData.name}</h2>
            <p className="player-tag">{playerData.tag}</p>
          </div>
          <div className="trophy-count">
            <p>Trophy Count</p>
            <p className="trophy-value">{playerData.trophies}</p>
          </div>
        </div>

        <div className="player-stats">
          <div className="stat-box">
            <p>Exp Level</p>
            <p className="stat-value">{playerData.expLevel}</p>
          </div>
          <div className="stat-box">
            <p>Best Trophies</p>
            <p className="stat-value">{playerData.bestTrophies}</p>
          </div>
          <div className="stat-box">
            <p>Total Wins</p>
            <p className="stat-value">{playerData.wins}</p>
          </div>
          <div className="stat-box">
            <p>Total Cards</p>
            <p className="stat-value">{playerData.cards?.length || 0}</p>
          </div>
        </div>
      </div>

      <div className="cards-by-type">
        {rarityOrder.map((rarity) => (
          cardsByType[rarity] && (
            <div key={rarity} className="rarity-section">
              <h3 className={`rarity-header ${rarity.toLowerCase()}`}>
                {rarity} Cards ({cardsByType[rarity].length})
              </h3>

              <div className="cards-grid">
                {cardsByType[rarity].map((card, idx) => (
                  <div key={idx} className="card">
                    <h4>{card.name}</h4>

                    <div className="card-level">
                      <p>Lvl {card.level}</p>
                    </div>

                    <div className="card-info">
                      {card.count && (
                        <p>
                          <span>Count:</span> {card.count}
                        </p>
                      )}
                      {card.starLevel && (
                        <p>
                          <span>⭐</span> {card.starLevel}
                        </p>
                      )}
                    </div>

                    {card.count && (
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${Math.min((card.count / 100) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

export default PlayerCards;
