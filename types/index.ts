/**
 * TypeScript interfaces for Clash Royale Deck Builder
 * Based on Official Clash Royale API responses
 */

// ============================================================================
// API Response Types (Official CR API)
// ============================================================================

/**
 * Card rarity levels in Clash Royale
 */
export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'champion';

/**
 * Card object from API responses
 */
export interface Card {
  id: number;
  name: string;
  elixirCost: number;
  iconUrls: {
    medium: string;
    evolutionMedium?: string;
  };
  rarity?: CardRarity;
  maxLevel: number;
}

/**
 * Player's card with level information
 */
export interface PlayerCard extends Card {
  level: number;
  count: number;
  starLevel?: number;
}

/**
 * Player data from /players/{tag} endpoint
 */
export interface PlayerData {
  tag: string;
  name: string;
  expLevel: number;
  trophies: number;
  bestTrophies: number;
  wins: number;
  losses: number;
  cards: PlayerCard[];
  currentDeck: Card[];
  starPowers?: Card[];
  evolutions?: Card[];
}

/**
 * Top player from /locations/global/rankings/players
 */
export interface RankedPlayer {
  tag: string;
  name: string;
  expLevel: number;
  trophies: number;
  rank: number;
  previousRank: number;
  clan?: {
    tag: string;
    name: string;
    badgeId: number;
  };
}

/**
 * Global rankings response
 */
export interface GlobalRankingsResponse {
  items: RankedPlayer[];
  paging?: {
    cursors: {
      after?: string;
    };
  };
}

// ============================================================================
// Application-Specific Types
// ============================================================================

/**
 * Deck with calculated metadata
 * This is what we store after processing Top 50 player decks
 */
export interface Deck {
  cards: Card[];
  avgElixir: number;
  playerName: string;
  playerTag: string;
  playerTrophies: number;
  hasEvolution: boolean;
}

/**
 * Filtered deck with user-specific calculations
 * This extends Deck with user's personal card levels
 */
export interface FilteredDeck extends Deck {
  userAvgLevel: number;
  isFullyOwned: boolean;
  missingCards: string[];
  levelStatus: 'high' | 'medium' | 'low'; // Green, Yellow, Red
}

/**
 * User's card collection (simplified for filtering)
 */
export interface UserCollection {
  [cardId: number]: {
    level: number;
    name: string;
  };
}

/**
 * Recent player search history (localStorage)
 */
export interface RecentSearch {
  tag: string;
  name: string;
  lastSearched: number; // timestamp
}

/**
 * Filter options for deck filtering
 */
export interface DeckFilters {
  includeCard?: string; // Card name to include
  excludeCard?: string; // Card name to exclude
  requireEvolution?: boolean;
  minAvgLevel?: number;
}

/**
 * API error response structure
 */
export interface ApiError {
  reason: string;
  message: string;
}

/**
 * Loading states for the application
 */
export type LoadingState = 'idle' | 'loading-player' | 'loading-decks' | 'filtering' | 'complete' | 'error';

/**
 * Application state (for main page)
 */
export interface AppState {
  playerTag: string;
  playerData: PlayerData | null;
  userCollection: UserCollection;
  topDecks: Deck[];
  filteredDecks: FilteredDeck[];
  loadingState: LoadingState;
  error: string | null;
  filters: DeckFilters;
}

// ============================================================================
// Cached Data Types (for server-side caching)
// ============================================================================

/**
 * Cached top decks with TTL
 */
export interface CachedTopDecks {
  decks: Deck[];
  cachedAt: number; // timestamp
  expiresAt: number; // timestamp
}
