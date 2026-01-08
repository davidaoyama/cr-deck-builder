import { NextResponse } from 'next/server';
import { createApiHeaders, CR_API_CONFIG } from '@/lib/config';
import { getCachedTopDecks, setCachedTopDecks } from '@/lib/cache';
import type { GlobalRankingsResponse, PlayerData, Deck, ApiError } from '@/types';

/**
 * GET /api/top-decks
 * Fetches top 50 global players and extracts their current decks
 * Implements 60-minute caching to avoid hitting API 50 times per user
 */
export async function GET() {
  try {
    // Check cache first
    const cachedDecks = getCachedTopDecks();
    if (cachedDecks) {
      return NextResponse.json({ decks: cachedDecks, cached: true });
    }

    console.log('[API] Cache miss - fetching fresh top decks');

    // Step 1: Fetch top players from North America
    // Note: The API doesn't have a single "global" rankings endpoint
    // We'll fetch from North America which has high player activity
    const rankingsResponse = await fetch(
      `${CR_API_CONFIG.baseUrl}/locations/57000001/rankings/players?limit=50`,
      {
        headers: createApiHeaders(),
      }
    );

    if (!rankingsResponse.ok) {
      const errorData = await rankingsResponse.json().catch(() => ({}));
      console.error(`[API] Failed to fetch rankings: ${rankingsResponse.status}`, errorData);

      return NextResponse.json(
        {
          reason: 'RANKINGS_ERROR',
          message: errorData.message || 'Failed to fetch top players'
        } as ApiError,
        { status: rankingsResponse.status }
      );
    }

    const rankingsData: GlobalRankingsResponse = await rankingsResponse.json();
    console.log(`[API] Rankings response:`, JSON.stringify(rankingsData, null, 2).substring(0, 500));
    console.log(`[API] Fetched ${rankingsData.items?.length || 0} top players`);

    // Step 2: Fetch each player's full profile to get their current deck
    // Process in batches to avoid overwhelming the API
    const decks: Deck[] = [];
    const BATCH_SIZE = 10;

    for (let i = 0; i < rankingsData.items.length; i += BATCH_SIZE) {
      const batch = rankingsData.items.slice(i, i + BATCH_SIZE);

      const deckPromises = batch.map(async (rankedPlayer) => {
        try {
          const encodedTag = encodeURIComponent(rankedPlayer.tag);
          const playerResponse = await fetch(
            `${CR_API_CONFIG.baseUrl}/players/${encodedTag}`,
            {
              headers: createApiHeaders(),
            }
          );

          if (!playerResponse.ok) {
            console.warn(`[API] Failed to fetch player ${rankedPlayer.tag}: ${playerResponse.status}`);
            return null;
          }

          const playerData: PlayerData = await playerResponse.json();

          // Ensure player has a valid current deck (8 cards)
          if (!playerData.currentDeck || playerData.currentDeck.length !== 8) {
            console.warn(`[API] Player ${rankedPlayer.tag} has invalid deck (${playerData.currentDeck?.length || 0} cards)`);
            return null;
          }

          // Calculate average elixir cost
          const avgElixir = playerData.currentDeck.reduce((sum, card) => sum + card.elixirCost, 0) / 8;

          // Check if deck has evolution cards
          const hasEvolution = !!(playerData.evolutions && playerData.evolutions.length > 0);

          const deck: Deck = {
            cards: playerData.currentDeck,
            avgElixir: Math.round(avgElixir * 10) / 10, // Round to 1 decimal
            playerName: playerData.name,
            playerTag: playerData.tag,
            playerTrophies: rankedPlayer.trophies,
            hasEvolution,
          };

          return deck;
        } catch (error) {
          console.error(`[API] Error processing player ${rankedPlayer.tag}:`, error);
          return null;
        }
      });

      const batchDecks = await Promise.all(deckPromises);
      decks.push(...batchDecks.filter((deck): deck is Deck => deck !== null));

      // Small delay between batches to respect rate limits
      if (i + BATCH_SIZE < rankingsData.items.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`[API] Successfully extracted ${decks.length} valid decks from top players`);

    // Cache the results for 60 minutes
    setCachedTopDecks(decks);

    return NextResponse.json({ decks, cached: false });

  } catch (error) {
    console.error('[API] Unexpected error fetching top decks:', error);

    return NextResponse.json(
      {
        reason: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      } as ApiError,
      { status: 500 }
    );
  }
}
