"use client";

interface Period {
  lord: string;
  start: string;
  end: string;
  years: number;
  sub_periods?: Period[];
}

function PeriodNode({ period, level }: { period: Period; level: number }) {
  return (
    <li className="ml-4">
      <div className="flex gap-2 items-baseline">
        <span className="font-semibold text-accent">{period.lord}</span>
        <span className="opacity-70 text-xs">
          {period.start} → {period.end} ({period.years.toFixed(1)}y)
        </span>
      </div>
      {level < 1 && period.sub_periods && period.sub_periods.length > 0 && (
        <ul className="border-l border-white/10 mt-1">
          {period.sub_periods.map((sp, i) => (
            <PeriodNode key={i} period={sp} level={level + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function DasaTree({ mahadashas }: { mahadashas: Period[] }) {
  return (
    <ul className="space-y-1 text-sm">
      {mahadashas.map((m, i) => (
        <PeriodNode key={i} period={m} level={0} />
      ))}
    </ul>
  );
}
