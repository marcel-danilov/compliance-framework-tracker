import { useTranslation } from '../lib/useTranslation';

const BASE_CONFIG = {
  'Not Started':     { dot: 'bg-gray-400',  badge: 'bg-gray-100 text-gray-600 dark:bg-brand-700 dark:text-brand-300' },
  'In Progress':     { dot: 'bg-azure-500', badge: 'bg-azure-50 text-azure-700 dark:bg-azure-900/30 dark:text-azure-300' },
  Implemented:       { dot: 'bg-green-500', badge: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' },
  'Not Implemented': { dot: 'bg-red-500',   badge: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' },
  'N/A':             { dot: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' },
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
