import type { FilteredDeck } from '@/types';
import StatusBadge from './StatusBadge';
import { formatNumber } from '@/lib/utils';

interface DeckCardProps {
  deck: FilteredDeck;
}

export default function DeckCard({ deck }: DeckCardProps) {
  return (
    <div className="cr-card p-6">
      {/* Player Info */}
      <div className="mb-4">
        <h3 className="text-lg font-bold" style={{ color: '#EDEDED' }}>
          {deck.playerName}
        </h3>
        <div className="flex items-center gap-2 text-sm" style={{ color: '#94A3B8' }}>
          <span>{deck.playerTag}</span>
          <span>•</span>
          <span>{formatNumber(deck.playerTrophies)} 🏆</span>
        </div>
      </div>

      {/* Cards Grid (2x4) */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {deck.cards.map((card, index) => (
          <div
            key={`${card.id}-${index}`}
            className="aspect-square rounded overflow-hidden"
            style={{ backgroundColor: '#1A2347' }}
          >
            <img
              src={card.iconUrls.medium}
              alt={card.name}
              className="w-full h-full object-cover"
              title={card.name}
            />
          </div>
        ))}
      </div>

      {/* Metadata */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <span style={{ color: '#94A3B8' }}>
            Avg Elixir: <span style={{ color: '#FFC043' }}>{deck.avgElixir}</span>
          </span>
          {deck.hasEvolution && (
            <span className="cr-badge-legendary text-xs">EVO</span>
          )}
        </div>
        <StatusBadge avgLevel={deck.userAvgLevel} levelStatus={deck.levelStatus} />
      </div>
    </div>
  );
}
