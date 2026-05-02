import type { ConditionKey } from '@shared/types';
import { Badge } from '@/components/ui/badge';

interface ConditionBadgeProps {
  conditionKey: ConditionKey;
  conditionLabel: string;
  scoreDateLabel: string;
}

export function ConditionBadge({ conditionKey, conditionLabel, scoreDateLabel }: ConditionBadgeProps) {
  return (
    <div className="flex flex-col items-end gap-1 flex-shrink-0">
      <Badge variant={conditionKey}>
        <span className="w-2 h-2 rounded-full bg-current flex-shrink-0" />
        {conditionLabel}
      </Badge>
      <span className="text-xs text-text-faint">{scoreDateLabel}</span>
    </div>
  );
}
