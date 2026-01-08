/**
 * Core business logic for the "Can I Build It?" algorithm
 * Implements strict ownership checking and level calculations
 */

import type { Deck, FilteredDeck, UserCollection, PlayerCard, DeckFilters } from '@/types';

/**
 * Step 1: Strict Ownership Check
 * Returns only decks where user owns ALL 8 cards
 */
export function filterDecksByOwnership(
  decks: Deck[],
  userCollection: UserCollection
): Deck[] {
  return decks.filter((deck) => {
    // Check if user owns all 8 cards in the deck
    const ownsAllCards = deck.cards.every((card) => {
      return userCollection[card.id] !== undefined;
    });

    return ownsAllCards;
  });
}

/**
 * Step 2: Level Calculation (The "Real" Stats)
 * Calculate user's average card level for a specific deck
 * DO NOT use Top Player's levels (they're all Lvl 15)
 */
export function calculateUserDeckLevel(
  deck: Deck,
  userCollection: UserCollection
): number {
  const totalLevels = deck.cards.reduce((sum, card) => {
    const userCard = userCollection[card.id];
    return sum + (userCard?.level || 0);
  }, 0);

  return Math.round((totalLevels / 8) * 10) / 10; // Round to 1 decimal
}

/**
 * Determine level status based on average level
 * Green if >13, Yellow if 11-13, Red if <11
 */
export function getLevelStatus(avgLevel: number): 'high' | 'medium' | 'low' {
  if (avgLevel > 13) return 'high';
  if (avgLevel >= 11) return 'medium';
  return 'low';
}

/**
 * Get missing cards from a deck
 */
export function getMissingCards(
  deck: Deck,
  userCollection: UserCollection
): string[] {
  return deck.cards
    .filter((card) => !userCollection[card.id])
    .map((card) => card.name);
}

/**
 * Main filtering function - combines ownership check + level calculation
 * Returns FilteredDecks with user-specific metadata
 */
export function filterDecks(
  decks: Deck[],
  userCollection: UserCollection,
  filters?: DeckFilters
): FilteredDeck[] {
  // Start with decks user can build
  let buildableDecks = filterDecksByOwnership(decks, userCollection);

  // Apply additional filters if provided
  if (filters) {
    if (filters.includeCard) {
      buildableDecks = buildableDecks.filter((deck) =>
        deck.cards.some((card) => card.name === filters.includeCard)
      );
    }

    if (filters.excludeCard) {
      buildableDecks = buildableDecks.filter((deck) =>
        !deck.cards.some((card) => card.name === filters.excludeCard)
      );
    }

    if (filters.requireEvolution) {
      buildableDecks = buildableDecks.filter((deck) => deck.hasEvolution);
    }

    if (filters.minAvgLevel) {
      buildableDecks = buildableDecks.filter((deck) => {
        const avgLevel = calculateUserDeckLevel(deck, userCollection);
        return avgLevel >= filters.minAvgLevel!;
      });
    }
  }

  // Map to FilteredDeck with user-specific calculations
  return buildableDecks.map((deck) => {
    const userAvgLevel = calculateUserDeckLevel(deck, userCollection);
    const missingCards = getMissingCards(deck, userCollection);

    return {
      ...deck,
      userAvgLevel,
      isFullyOwned: missingCards.length === 0,
      missingCards,
      levelStatus: getLevelStatus(userAvgLevel),
    };
  });
}

/**
 * Get impossible decks (decks user CANNOT build)
 * Useful for "What cards do I need?" feature
 */
export function getImpossibleDecks(
  decks: Deck[],
  userCollection: UserCollection
): FilteredDeck[] {
  const impossibleDecks = decks.filter((deck) => {
    const ownsAllCards = deck.cards.every((card) => userCollection[card.id]);
    return !ownsAllCards;
  });

  return impossibleDecks.map((deck) => {
    const userAvgLevel = calculateUserDeckLevel(deck, userCollection);
    const missingCards = getMissingCards(deck, userCollection);

    return {
      ...deck,
      userAvgLevel,
      isFullyOwned: false,
      missingCards,
      levelStatus: getLevelStatus(userAvgLevel),
    };
  });
}

/**
 * Convert PlayerCard[] to UserCollection for efficient lookups
 */
export function createUserCollection(cards: PlayerCard[]): UserCollection {
  const collection: UserCollection = {};

  for (const card of cards) {
    collection[card.id] = {
      level: card.level,
      name: card.name,
    };
  }

  return collection;
}
