import type { ScoredTerrainClass, TerrainClass } from '@shared/types';

const TERRAIN_LABEL: Record<TerrainClass, string> = {
  'engineered':       'Engineered',
  'reinforced':       'Reinforced',
  'natural-improved': 'Natural+',
  'natural':          'Natural',
};

// Colours run from cool (fast-draining) to earthy (slow-draining)
const TERRAIN_BG: Record<TerrainClass, string> = {
  'engineered':       '#1a6fa8',
  'reinforced':       '#3a7d44',
  'natural-improved': '#c45c00',
  'natural':          '#7a5c3a',
};

const STATUS_COLOR: Record<string, string> = {
  good:  'var(--color-good)',
  tacky: 'var(--color-tacky)',
  boggy: 'var(--color-boggy)',
  avoid: 'var(--color-avoid)',
};

interface TrailTypesListProps {
  trailConditions: ScoredTerrainClass[];
}

export function TrailTypesList({ trailConditions }: TrailTypesListProps) {
  return (
    <div className="flex flex-col gap-2">
      {trailConditions.map(({ terrainClass, status, statusClass }) => (
        <div
          key={terrainClass}
          className="flex items-center justify-between px-3 py-1.5 rounded-md bg-surface-2 gap-2"
        >
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded text-white select-none flex-shrink-0"
            style={{ background: TERRAIN_BG[terrainClass] }}
          >
            {TERRAIN_LABEL[terrainClass]}
          </span>
          <span
            className="text-xs font-semibold whitespace-nowrap flex-shrink-0"
            style={{ color: STATUS_COLOR[statusClass] }}
          >
            {status}
          </span>
        </div>
      ))}
    </div>
  );
}
