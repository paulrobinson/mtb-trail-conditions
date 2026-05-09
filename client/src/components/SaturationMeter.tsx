interface SaturationMeterProps {
  saturationPct: number;
  totalLast7: string;
  totalLast14: string;
  dryStreak: number;
}

const COLOR_MAP: Record<string, string> = {
  good:  'var(--color-good)',
  tacky: 'var(--color-tacky)',
  boggy: 'var(--color-boggy)',
  avoid: 'var(--color-avoid)',
};

function barColor(pct: number): string {
  if (pct < 25) return COLOR_MAP.good!;
  if (pct < 50) return COLOR_MAP.tacky!;
  if (pct < 75) return COLOR_MAP.boggy!;
  return COLOR_MAP.avoid!;
}

export function SaturationMeter({ saturationPct, totalLast7, totalLast14, dryStreak }: SaturationMeterProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Saturation bar */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-text-muted flex-shrink-0 w-[60px]">Overall</span>
        <div className="flex-1 h-1.5 bg-surface-offset rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${saturationPct}%`, background: barColor(saturationPct) }}
          />
        </div>
        <span className="text-xs text-text-faint w-9 text-right">{saturationPct}%</span>
      </div>

      {/* Stat pills */}
      <div className="flex flex-wrap gap-2">
        <StatPill label="Rain prev 7d" value={`${totalLast7}mm`} />
        <StatPill label="Rain prev 14d" value={`${totalLast14}mm`} />
        <StatPill label="Dry run-in" value={dryStreak > 0 ? `${dryStreak}d` : '—'} />
      </div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-2 text-xs text-text-muted">
      {label}: <strong className="text-text font-bold">{value}</strong>
    </div>
  );
}
