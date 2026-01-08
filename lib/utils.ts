/**
 * Utility functions for validation, formatting, and localStorage
 */

import type { RecentSearch } from '@/types';

/**
 * Validate and format player tag
 * Ensures tag starts with # and contains valid characters
 */
export function validatePlayerTag(tag: string): {
  isValid: boolean;
  formatted: string;
  error?: string;
} {
  if (!tag || tag.trim().length === 0) {
    return {
      isValid: false,
      formatted: '',
      error: 'Player tag cannot be empty',
    };
  }

  // Remove whitespace
  let cleaned = tag.trim().toUpperCase();

  // Add # if missing
  if (!cleaned.startsWith('#')) {
    cleaned = `#${cleaned}`;
  }

  // Validate format (#XXXXXXXX - alphanumeric after #)
  const tagRegex = /^#[0-9A-Z]{3,12}$/;

  if (!tagRegex.test(cleaned)) {
    return {
      isValid: false,
      formatted: cleaned,
      error: 'Invalid tag format. Must be #TAG (e.g., #99U2L2)',
    };
  }

  return {
    isValid: true,
    formatted: cleaned,
  };
}

/**
 * Get level badge color based on average level
 * Green if >13, Yellow if 11-13, Red if <11
 */
export function getLevelBadgeColor(avgLevel: number): string {
  if (avgLevel > 13) return '#4ADE80'; // Green
  if (avgLevel >= 11) return '#F59E0B'; // Yellow
  return '#EF4444'; // Red
}

/**
 * Get level badge CSS class
 */
export function getLevelBadgeClass(avgLevel: number): string {
  if (avgLevel > 13) return 'cr-badge-common'; // Green
  if (avgLevel >= 11) return 'cr-badge-epic'; // Orange/Yellow
  return 'cr-badge-rare'; // Red
}

// ============================================================================
// Recent Searches (localStorage)
// ============================================================================

const RECENT_SEARCHES_KEY = 'cr_recent_searches';
const MAX_RECENT_SEARCHES = 5;

/**
 * Get recent player searches from localStorage
 */
export function getRecentSearches(): RecentSearch[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!stored) return [];

    const searches: RecentSearch[] = JSON.parse(stored);
    return searches.sort((a, b) => b.lastSearched - a.lastSearched);
  } catch (error) {
    console.error('Error reading recent searches:', error);
    return [];
  }
}

/**
 * Add a player search to recent history
 */
export function addRecentSearch(tag: string, name: string): void {
  if (typeof window === 'undefined') return;

  try {
    const searches = getRecentSearches();

    // Remove existing entry for this tag
    const filtered = searches.filter((s) => s.tag !== tag);

    // Add new entry at the beginning
    const newSearch: RecentSearch = {
      tag,
      name,
      lastSearched: Date.now(),
    };

    const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);

    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving recent search:', error);
  }
}

/**
 * Clear all recent searches
 */
export function clearRecentSearches(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (error) {
    console.error('Error clearing recent searches:', error);
  }
}

// ============================================================================
// Formatting Helpers
// ============================================================================

/**
 * Format number with commas (e.g., 1234 -> 1,234)
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Format elixir cost (e.g., 3.5 -> "3.5")
 */
export function formatElixir(elixir: number): string {
  return elixir.toFixed(1);
}

/**
 * Format date relative to now (e.g., "2 minutes ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}
