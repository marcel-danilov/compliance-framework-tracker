import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { useTranslation } from '../lib/useTranslation';
import { ShieldCheck, CheckCircle2, BarChart3, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

const STATUS_ORDER = ['Implemented', 'In Progress', 'N/A', 'Not Implemented', 'Not Started'];
const STATUS_COLORS = {
  Implemented:      { bg: '#22c55e', light: 'bg-green-100/80 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  'In Progress':    { bg: '#3b82f6', light: 'bg-blue-100/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  'N/A':            { bg: '#f59e0b', light: 'bg-amber-100/80 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  'Not Implemented':{ bg: '#ef4444', light: 'bg-red-100/80 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  'Not Started':    { bg: '#c4ae93', light: 'bg-brand-100/70 text-brand-500 dark:bg-brand-700/50 dark:text-brand-300' },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const t = useTranslation();
  const norms = useLiveQuery(() => db.norms.toArray(), []);
  const controls = useLiveQuery(() => db.controls.toArray(), []);
  const [expandedNorm, setExpandedNorm] = useState(null);

  const stats = useMemo(() => {
    if (!norms || !controls) return null;
    const total = controls.length;
    const implemented = controls.filter((c) => c.status === 'Implemented').length;
    const overallRate = total ? Math.round((implemented / total) * 100) : 0;
    const normStats = norms.map((norm) => {
      const nc = controls.filter((c) => c.normId === norm.id);
      const ni = nc.filter((c) => c.status === 'Implemented').length;
      const pct = nc.length ? Math.round((ni / nc.length) * 100) : 0;

      const statsByStatus = {};
      for (const s of STATUS_ORDER) {
        statsByStatus[s] = nc.filter((c) => c.status === s).length;
      }

      const categoryMap = {};
      for (const c of nc) {
        const cat = c.category || '—';
        if (!categoryMap[cat]) categoryMap[cat] = { total: 0, implemented: 0 };
        categoryMap[cat].total++;
        if (c.status === 'Implemented') categoryMap[cat].implemented++;
      }
      const statsByCategory = Object.entries(categoryMap)
        .map(([cat, v]) => ({ cat, ...v, pct: Math.round((v.implemented / v.total) * 100) }))
        .sort((a, b) => b.total - a.total);

      return { ...norm, total: nc.length, implemented: ni, pct, statsByStatus, statsByCategory };
    });
    return { total, implemented, overallRate, normStats };
  }, [norms, controls]);

  if (!stats) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-brand-400 text-sm">{t.common.loading}</p>
    </div>
  );

  const empty = stats.total === 0;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-brand-800 dark:text-brand-100 tracking-tight">{t.dashboard.title}</h1>
        <p className="text-sm text-brand-500 dark:text-brand-300 mt-1 font-normal">{t.dashboard.subtitle}</p>
      </div>

      {empty && (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-brand-200/70 dark:border-brand-700/50 rounded-2xl text-center glass-card shadow-glass">
          <div className="w-16 h-16 rounded-2xl bg-brand-100/70 dark:bg-brand-700/50 flex items-center justify-center mb-5">
            <BarChart3 className="h-8 w-8 text-brand-400" aria-hidden="true" />
          </div>
          <p className="text-brand-500 dark:text-brand-300 font-medium mb-1">{t.dashboard.empty}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 flex items-center gap-1.5 text-sm text-azure-500 hover:text-azure-600 font-medium transition-colors"
          >
            {t.dashboard.goToNorms} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {!empty && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <KpiCard
              label={t.dashboard.totalControls}
              value={stats.total}
              icon={<ShieldCheck className="h-5 w-5 text-brand-400" aria-hidden="true" />}
              accent="border-l-brand-400"
            />
            <KpiCard
              label={t.dashboard.implemented}
              value={`${stats.overallRate}%`}
              sub={t.dashboard.implementedOf(stats.implemented, stats.total)}
              icon={<CheckCircle2 className="h-5 w-5 text-green-500" aria-hidden="true" />}
              accent="border-l-green-400"
            />
          </div>

          <div className="glass-card shadow-glass rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-brand-200/40 dark:border-brand-700/40">
              <h2 className="font-semibold text-brand-800 dark:text-brand-100 tracking-tight">{t.dashboard.progress}</h2>
            </div>

            <div className="divide-y divide-brand-200/30 dark:divide-brand-700/40">
              {stats.normStats.map((norm) => {
                const isOpen = expandedNorm === norm.id;
                return (
                  <div key={norm.id}>
                    <button
                      className="w-full text-left px-6 py-4 hover:bg-brand-100/30 dark:hover:bg-brand-700/20 transition-colors"
                      onClick={() => setExpandedNorm(isOpen ? null : norm.id)}
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-sm font-semibold text-brand-700 dark:text-brand-100 flex items-center gap-2">
                          {norm.name}
                        </span>
                        <div className="flex items-center gap-3 text-xs text-brand-400 dark:text-brand-400">
                          <span>{t.dashboard.progressOf(norm.implemented, norm.total)}</span>
                          <span className="font-bold text-brand-700 dark:text-brand-100 w-9 text-right tabular-nums">
                            {norm.pct}%
                          </span>
                          {isOpen
                            ? <ChevronUp className="h-4 w-4 text-brand-300" />
                            : <ChevronDown className="h-4 w-4 text-brand-300" />}
                        </div>
                      </div>
                      <div className="h-2 bg-brand-100/60 dark:bg-brand-700/50 rounded-full overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-700"
                          style={{
                            width: `${norm.pct}%`,
                            backgroundColor: norm.pct === 100 ? '#22c55e' : '#3b82f6',
                          }}
                        />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-6 pt-2 bg-brand-50/40 dark:bg-brand-900/20 border-t border-brand-200/30 dark:border-brand-700/30">

                        <div className="mb-4">
                          <StackedBar statsByStatus={norm.statsByStatus} total={norm.total} />
                        </div>

                        <div className="flex flex-wrap gap-2 mb-5">
                          {STATUS_ORDER.map((s) => {
                            const count = norm.statsByStatus[s];
                            if (count === 0) return null;
                            return (
                              <span
                                key={s}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[s].light}`}
                              >
                                <span
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: STATUS_COLORS[s].bg }}
                                />
                                {t.controlList.statusLabels[s]} — {count}
                              </span>
                            );
                          })}
                        </div>

                        {norm.statsByCategory.length > 1 && (
                          <div className="mb-5">
                            <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-2">
                              {t.controlList.columns.category}
                            </p>
                            <div className="space-y-2">
                              {norm.statsByCategory.map(({ cat, total, implemented, pct }) => (
                                <div key={cat} className="flex items-center gap-3">
                                  <span className="text-xs text-brand-400 dark:text-brand-300 w-36 truncate flex-shrink-0" title={cat}>{cat}</span>
                                  <div className="flex-1 h-1.5 bg-brand-100/60 dark:bg-brand-700/50 rounded-full overflow-hidden">
                                    <div
                                      className="h-1.5 rounded-full"
                                      style={{
                                        width: `${pct}%`,
                                        backgroundColor: pct === 100 ? '#22c55e' : '#3b82f6',
                                      }}
                                    />
                                  </div>
                                  <span className="text-xs tabular-nums text-brand-400 w-20 text-right flex-shrink-0">
                                    {implemented}/{total} ({pct}%)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/norms/${norm.id}`); }}
                          className="flex items-center gap-1.5 text-xs font-semibold text-azure-500 hover:text-azure-600 transition-colors"
                        >
                          {t.normList.open} <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StackedBar({ statsByStatus, total }) {
  if (total === 0) return null;
  return (
    <div className="h-3 flex rounded-full overflow-hidden gap-px bg-brand-100/60 dark:bg-brand-700/50">
      {STATUS_ORDER.map((s) => {
        const count = statsByStatus[s];
        if (count === 0) return null;
        const pct = (count / total) * 100;
        return (
          <div
            key={s}
            style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[s].bg }}
            title={`${s}: ${count}`}
          />
        );
      })}
    </div>
  );
}

function KpiCard({ label, value, sub, icon, accent }) {
  return (
    <div className={`glass-card shadow-glass rounded-xl p-5 border-l-4 ${accent}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-brand-400 dark:text-brand-400 uppercase tracking-widest">
          {label}
        </span>
        {icon}
      </div>
      <div className="text-3xl font-bold text-brand-800 dark:text-brand-100 tracking-tight">{value}</div>
      {sub && <p className="text-xs text-brand-400 dark:text-brand-400 mt-1 font-normal">{sub}</p>}
    </div>
  );
}
