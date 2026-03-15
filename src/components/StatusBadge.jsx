import { useTranslation } from '../lib/useTranslation';

const BASE_CONFIG = {
  'Not Started':     { dot: 'bg-stone-400',   badge: 'bg-stone-100/80 text-stone-600 dark:bg-stone-800/50 dark:text-stone-300' },
  'In Progress':     { dot: 'bg-blue-500',    badge: 'bg-blue-100/80 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  Implemented:       { dot: 'bg-emerald-500', badge: 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
  'Not Implemented': { dot: 'bg-rose-500',    badge: 'bg-rose-100/80 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400' },
  'N/A':             { dot: 'bg-amber-500',   badge: 'bg-amber-100/80 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
};

export default function StatusBadge({ status }) {
  const t = useTranslation();
  const base = BASE_CONFIG[status] ?? BASE_CONFIG['Not Started'];
  const label = t.statusBadge[status]?.label ?? status;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${base.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${base.dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}
