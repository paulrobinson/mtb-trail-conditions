import { useState } from 'react';
import type { MouseEvent } from 'react';
import type { ScoredTrail } from '@shared/types';

const GRADE_BG: Record<string, string> = {
  green:   '#3a7d44',
  blue:    '#1a6fa8',
  red:     '#c0392b',
  black:   '#1a1a1a',
  orange:  '#c45c00',
  natural: '#7a5c3a',
};

const STATUS_COLOR: Record<string, string> = {
  good:  'var(--color-good)',
  tacky: 'var(--color-tacky)',
  boggy: 'var(--color-boggy)',
  avoid: 'var(--color-avoid)',
};

interface Tooltip {
  text: string;
  x: number;
  y: number;
}

interface TrailTypesListProps {
  trailConditions: ScoredTrail[];
}

export function TrailTypesList({ trailConditions }: TrailTypesListProps) {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  function handleMouseEnter(e: MouseEvent<HTMLSpanElement>, name: string) {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ text: name, x: rect.left, y: rect.top });
  }

  return (
    <div className="flex flex-col gap-2">
      {trailConditions.map((trail, i) => (
        <div
          key={i}
          className="flex items-center justify-between px-3 py-1.5 rounded-md bg-surface-2 gap-2 min-w-0 overflow-hidden"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span
              className="text-xs font-bold px-1.5 py-0.5 rounded text-white cursor-pointer select-none flex-shrink-0"
              style={{ background: GRADE_BG[trail.grade] ?? '#888' }}
              onMouseEnter={e => handleMouseEnter(e, trail.name)}
              onMouseLeave={() => setTooltip(null)}
            >
              {trail.label}
            </span>
          </div>
          <span
            className="text-xs font-semibold whitespace-nowrap flex-shrink-0"
            style={{ color: STATUS_COLOR[trail.statusClass] }}
          >
            {trail.status}
          </span>
        </div>
      ))}

      {/* Fixed-position tooltip — escapes overflow:hidden */}
      {tooltip && (
        <div
          className="fixed z-[9999] px-2.5 py-1.5 rounded-md bg-surface-2 border border-border shadow-md text-xs text-text whitespace-nowrap pointer-events-none"
          style={{ top: tooltip.y - 38, left: tooltip.x }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
