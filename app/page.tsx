'use client';

import { useState } from 'react';

export default function Home() {
  const [playerTag, setPlayerTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testPlayerAPI = async () => {
    setLoading(true);
    setResult('');

    try {
      const encodedTag = encodeURIComponent(playerTag);
      const response = await fetch(`/api/player/${encodedTag}`);
      const data = await response.json();

      if (response.ok) {
        setResult(`✅ Found player: ${data.name} with ${data.cards.length} cards`);
      } else {
        setResult(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testTopDecksAPI = async () => {
    setLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/top-decks');
      const data = await response.json();

      if (response.ok) {
        setResult(`✅ Fetched ${data.decks.length} top decks ${data.cached ? '(from cache)' : '(fresh)'}`);
      } else {
        setResult(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-4" style={{
          background: 'linear-gradient(90deg, #7AA5F2 0%, #FFC043 50%, #7AA5F2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          CR Deck Builder
        </h1>
        <p className="text-center mb-12 text-lg" style={{ color: '#94A3B8' }}>
          Find meta decks you can build with your card collection
        </p>

        {/* API Test Section */}
        <div className="cr-card p-8 max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#FFC043' }}>
            API Test Panel
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-semibold" style={{ color: '#EDEDED' }}>
                Test Player API
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="cr-input flex-1"
                  placeholder="Enter player tag (e.g., #99U2L2)"
                  value={playerTag}
                  onChange={(e) => setPlayerTag(e.target.value)}
                  disabled={loading}
                />
                <button
                  className="cr-button-primary"
                  onClick={testPlayerAPI}
                  disabled={loading || !playerTag}
                >
                  Test
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-2 font-semibold" style={{ color: '#EDEDED' }}>
                Test Top Decks API
              </label>
              <button
                className="cr-button-secondary w-full"
                onClick={testTopDecksAPI}
                disabled={loading}
              >
                Fetch Top 50 Decks
              </button>
            </div>

            {loading && (
              <div className="text-center py-4" style={{ color: '#5B8DEE' }}>
                Loading...
              </div>
            )}

            {result && (
              <div
                className="p-4 rounded-lg font-mono text-sm"
                style={{ backgroundColor: '#1A2347', color: '#EDEDED' }}
              >
                {result}
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="cr-card p-6">
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#5B8DEE' }}>Player Sync</h3>
            <p className="text-sm" style={{ color: '#94A3B8' }}>
              Enter your player tag to sync your card collection
            </p>
          </div>

          <div className="cr-card p-6">
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#FFC043' }}>Meta Decks</h3>
            <p className="text-sm" style={{ color: '#94A3B8' }}>
              Fetches decks from top 50 global players
            </p>
          </div>

          <div className="cr-card p-6">
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#A057D9' }}>Smart Filter</h3>
            <p className="text-sm" style={{ color: '#94A3B8' }}>
              Shows only decks you can build right now
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
