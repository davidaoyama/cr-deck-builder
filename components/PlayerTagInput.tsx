'use client';

import { useState, useEffect } from 'react';
import { validatePlayerTag, getRecentSearches } from '@/lib/utils';
import type { RecentSearch } from '@/types';

interface PlayerTagInputProps {
  onSubmit: (tag: string) => void;
  isLoading: boolean;
  error: string | null;
}

export default function PlayerTagInput({ onSubmit, isLoading, error }: PlayerTagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validatePlayerTag(inputValue);

    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid player tag');
      return;
    }

    setValidationError(null);
    onSubmit(validation.formatted);
  };

  const handleRecentSearchClick = (tag: string) => {
    setInputValue(tag);
    setShowRecentSearches(false);
    onSubmit(tag);
  };

  return (
    <div className="max-w-2xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              className="cr-input w-full"
              placeholder="Enter player tag (e.g., #PPYLPG2VR)"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setValidationError(null);
              }}
              onFocus={() => setShowRecentSearches(true)}
              disabled={isLoading}
            />

            {/* Recent Searches Dropdown */}
            {showRecentSearches && recentSearches.length > 0 && !isLoading && (
              <div
                className="absolute top-full left-0 right-0 mt-2 rounded-lg overflow-hidden z-10"
                style={{ backgroundColor: '#1A2347' }}
              >
                <div className="p-2">
                  <p className="text-xs font-semibold mb-2" style={{ color: '#94A3B8' }}>
                    Recent Searches
                  </p>
                  {recentSearches.map((search) => (
                    <button
                      key={search.tag}
                      type="button"
                      className="w-full text-left px-3 py-2 rounded hover:bg-opacity-50 transition-colors"
                      style={{ backgroundColor: 'transparent' }}
                      onClick={() => handleRecentSearchClick(search.tag)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#0a0e27';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div className="font-semibold" style={{ color: '#EDEDED' }}>
                        {search.name}
                      </div>
                      <div className="text-xs" style={{ color: '#94A3B8' }}>
                        {search.tag}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="cr-button-primary px-8"
            disabled={isLoading || !inputValue}
          >
            {isLoading ? 'Loading...' : 'Search'}
          </button>
        </div>

        {/* Validation Error */}
        {validationError && (
          <p className="mt-2 text-sm" style={{ color: '#EF4444' }}>
            {validationError}
          </p>
        )}

        {/* API Error */}
        {error && (
          <p className="mt-2 text-sm" style={{ color: '#EF4444' }}>
            {error}
          </p>
        )}
      </form>

      {/* Click outside to close dropdown */}
      {showRecentSearches && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowRecentSearches(false)}
        />
      )}
    </div>
  );
}
