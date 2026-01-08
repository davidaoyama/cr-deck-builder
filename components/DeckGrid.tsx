import type { FilteredDeck } from '@/types';
import DeckCard from './DeckCard';
import LoadingSpinner from './LoadingSpinner';

interface DeckGridProps {
  decks: FilteredDeck[];
  isLoading: boolean;
}

export default function DeckGrid({ decks, isLoading }: DeckGridProps) {
  if (isLoading) {
    return <LoadingSpinner message="Loading decks..." />;
  }

  if (decks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl font-semibold mb-2" style={{ color: '#EDEDED' }}>
          No Buildable Decks Found
        </p>
        <p style={{ color: '#94A3B8' }}>
          You don't have all the cards needed for any meta decks yet. Keep upgrading!
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#FFC043' }}>
        Decks You Can Build ({decks.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {decks.map((deck, index) => (
          <DeckCard key={`${deck.playerTag}-${index}`} deck={deck} />
        ))}
      </div>
    </div>
  );
}
