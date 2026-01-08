/**
 * In-memory cache for top decks
 * Prevents hitting the API 50 times for every user request
 */

import type { CachedTopDecks, Deck } from '@/types';

// In-memory cache (60 minute TTL)
let topDecksCache: CachedTopDecks | null = null;

const CACHE_TTL = 60 * 60 * 1000; // 60 minutes in milliseconds

/**
 * Get cached top decks if still valid
 */
export function getCachedTopDecks(): Deck[] | null {
  if (!topDecksCache) {
    return null;
  }

  const now = Date.now();

  // Check if cache has expired
  if (now > topDecksCache.expiresAt) {
    console.log('[Cache] Top decks cache expired');
    topDecksCache = null;
    return null;
  }

  const remainingMinutes = Math.floor((topDecksCache.expiresAt - now) / 60000);
  console.log(`[Cache] Serving cached top decks (expires in ${remainingMinutes}m)`);

  return topDecksCache.decks;
}

/**
 * Set top decks cache with TTL
 */
export function setCachedTopDecks(decks: Deck[]): void {
  const now = Date.now();

  topDecksCache = {
    decks,
    cachedAt: now,
    expiresAt: now + CACHE_TTL,
  };

  console.log(`[Cache] Cached ${decks.length} top decks for 60 minutes`);
}

/**
 * Clear the cache (useful for debugging)
 */
export function clearTopDecksCache(): void {
  topDecksCache = null;
  console.log('[Cache] Top decks cache cleared');
}
