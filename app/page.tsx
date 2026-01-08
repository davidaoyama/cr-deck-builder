'use client';

import { useState } from 'react';
import PlayerTagInput from '@/components/PlayerTagInput';
import DeckGrid from '@/components/DeckGrid';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { PlayerData, Deck, FilteredDeck, UserCollection, LoadingState } from '@/types';
import { filterDecks, createUserCollection } from '@/lib/deck-filters';
import { addRecentSearch } from '@/lib/utils';

export default function Home() {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [userCollection, setUserCollection] = useState<UserCollection>({});
  const [topDecks, setTopDecks] = useState<Deck[]>([]);
  const [filteredDecks, setFilteredDecks] = useState<FilteredDeck[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);

  const handlePlayerTagSubmit = async (tag: string) => {
    setError(null);
    setLoadingState('loading-player');

    try {
      // Step 1: Fetch player data
      const encodedTag = encodeURIComponent(tag);
      const playerResponse = await fetch(`/api/player/${encodedTag}`);
      const playerDataResult = await playerResponse.json();

      if (!playerResponse.ok) {
        throw new Error(playerDataResult.message || 'Failed to fetch player data');
      }

      setPlayerData(playerDataResult);

      // Save to recent searches
      addRecentSearch(playerDataResult.tag, playerDataResult.name);

      // Create user collection for filtering
      const collection = createUserCollection(playerDataResult.cards);
      setUserCollection(collection);

      // Step 2: Fetch top decks
      setLoadingState('loading-decks');
      const decksResponse = await fetch('/api/top-decks');
      const decksDataResult = await decksResponse.json();

      if (!decksResponse.ok) {
        throw new Error(decksDataResult.message || 'Failed to fetch top decks');
      }

      setTopDecks(decksDataResult.decks);

      // Step 3: Filter decks
      setLoadingState('filtering');
      const buildableDecks = filterDecks(decksDataResult.decks, collection);
      setFilteredDecks(buildableDecks);

      setLoadingState('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoadingState('error');
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1
          className="text-5xl font-bold text-center mb-4"
          style={{
            background: 'linear-gradient(90deg, #7AA5F2 0%, #FFC043 50%, #7AA5F2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          CR Deck Builder
        </h1>
        <p className="text-center mb-12 text-lg" style={{ color: '#94A3B8' }}>
          Find meta decks you can build with your card collection
        </p>

        {/* Player Tag Input */}
        <PlayerTagInput
          onSubmit={handlePlayerTagSubmit}
          isLoading={loadingState !== 'idle' && loadingState !== 'complete' && loadingState !== 'error'}
          error={error}
        />

        {/* Loading States */}
        {loadingState === 'loading-player' && (
          <LoadingSpinner message="Fetching your card collection..." />
        )}

        {loadingState === 'loading-decks' && (
          <LoadingSpinner message="Fetching top meta decks (this may take ~30 seconds)..." />
        )}

        {loadingState === 'filtering' && (
          <LoadingSpinner message="Finding decks you can build..." />
        )}

        {/* Results */}
        {loadingState === 'complete' && playerData && (
          <div>
            {/* Player Info Banner */}
            <div className="cr-card p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: '#EDEDED' }}>
                    {playerData.name}
                  </h2>
                  <p style={{ color: '#94A3B8' }}>
                    {playerData.tag} • {playerData.cards.length} cards unlocked
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold" style={{ color: '#FFC043' }}>
                    {playerData.trophies.toLocaleString()}
                  </p>
                  <p className="text-sm" style={{ color: '#94A3B8' }}>
                    Trophies
                  </p>
                </div>
              </div>
            </div>

            {/* Deck Grid */}
            <DeckGrid decks={filteredDecks} isLoading={false} />
          </div>
        )}

        {/* Info Cards (shown when idle) */}
        {loadingState === 'idle' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <div className="cr-card p-6">
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#5B8DEE' }}>
                Player Sync
              </h3>
              <p className="text-sm" style={{ color: '#94A3B8' }}>
                Enter your player tag to sync your card collection
              </p>
            </div>

            <div className="cr-card p-6">
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#FFC043' }}>
                Meta Decks
              </h3>
              <p className="text-sm" style={{ color: '#94A3B8' }}>
                Fetches decks from top 50 global players
              </p>
            </div>

            <div className="cr-card p-6">
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#A057D9' }}>
                Smart Filter
              </h3>
              <p className="text-sm" style={{ color: '#94A3B8' }}>
                Shows only decks you can build right now
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
