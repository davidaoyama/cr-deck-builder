import { getLevelBadgeClass } from '@/lib/utils';

interface StatusBadgeProps {
  avgLevel: number;
  levelStatus: 'high' | 'medium' | 'low';
}

export default function StatusBadge({ avgLevel, levelStatus }: StatusBadgeProps) {
  const badgeClass = getLevelBadgeClass(avgLevel);

  return (
    <span className={badgeClass}>
      Avg Level: {avgLevel.toFixed(1)}
    </span>
  );
}
