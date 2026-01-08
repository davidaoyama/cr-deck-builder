'use client';

import { useState, useEffect } from 'react';
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
  const [allDecksAsFiltered, setAllDecksAsFiltered] = useState<FilteredDeck[]>([]);
  const [filteredDecks, setFilteredDecks] = useState<FilteredDeck[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Load top decks on mount
  useEffect(() => {
    const loadTopDecks = async () => {
      if (initialLoadDone) return;

      setLoadingState('loading-decks');
      try {
        const response = await fetch('/api/top-decks');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch top decks');
        }

        setTopDecks(data.decks);

        // Convert all decks to FilteredDeck format (show all by default)
        const allDecks: FilteredDeck[] = data.decks.map((deck: Deck) => ({
          ...deck,
          userAvgLevel: 0,
          isFullyOwned: false,
          missingCards: [],
          levelStatus: 'low' as const,
        }));

        setAllDecksAsFiltered(allDecks);
        setLoadingState('idle');
        setInitialLoadDone(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load decks');
        setLoadingState('error');
      }
    };

    loadTopDecks();
  }, [initialLoadDone]);

  const handlePlayerTagSubmit = async (tag: string) => {
    setError(null);
    setLoadingState('loading-player');

    try {
      // Fetch player data
      const encodedTag = encodeURIComponent(tag);
      const playerResponse = await fetch(`/api/player/${encodedTag}`);
      const playerDataResult = await playerResponse.json();

      if (!playerResponse.ok) {
        throw new Error(playerDataResult.message || 'Failed to fetch player data');
      }

      setPlayerData(playerDataResult);
      addRecentSearch(playerDataResult.tag, playerDataResult.name);

      // Create user collection for filtering
      const collection = createUserCollection(playerDataResult.cards);
      setUserCollection(collection);

      // Filter decks based on user's collection
      setLoadingState('filtering');
      console.log('[Debug] User collection size:', Object.keys(collection).length);
      console.log('[Debug] Top decks count:', topDecks.length);

      const buildableDecks = filterDecks(topDecks, collection);
      console.log('[Debug] Buildable decks:', buildableDecks.length);

      setFilteredDecks(buildableDecks);
      setLoadingState('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoadingState('error');
    }
  };

  const displayDecks = playerData ? filteredDecks : allDecksAsFiltered;
  const showPlayerBanner = playerData && loadingState === 'complete';

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
          {playerData
            ? 'Decks you can build with your collection'
            : 'Browse top 50 meta decks from global leaderboard'}
        </p>

        {/* Player Tag Input */}
        <PlayerTagInput
          onSubmit={handlePlayerTagSubmit}
          isLoading={loadingState === 'loading-player' || loadingState === 'filtering'}
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

        {/* Player Info Banner */}
        {showPlayerBanner && (
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
        )}

        {/* Deck Grid */}
        {(loadingState === 'idle' || loadingState === 'complete') && (
          <DeckGrid
            decks={displayDecks}
            isLoading={false}
          />
        )}
      </div>
    </main>
  );
}
