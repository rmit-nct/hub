// A single compact stat cell for the dynamic-QR analytics strip.
export function AnalyticsStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-center dark:border-slate-700 dark:bg-slate-800">
      <p className="truncate text-[11px] text-slate-500 uppercase tracking-wide dark:text-slate-400">
        {label}
      </p>
      <p className="truncate font-semibold text-slate-900 text-sm dark:text-white">
        {value}
      </p>
    </div>
  );
}
