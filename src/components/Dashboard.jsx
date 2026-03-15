import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { useTranslation } from '../lib/useTranslation';
import { ShieldCheck, CheckCircle2, BarChart3, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const t = useTranslation();
  const norms = useLiveQuery(() => db.norms.toArray(), []);
  const controls = useLiveQuery(() => db.controls.toArray(), []);

  const stats = useMemo(() => {
    if (!norms || !controls) return null;
    const total = controls.length;
    const implemented = controls.filter((c) => c.status === 'Implemented').length;
    const overallRate = total ? Math.round((implemented / total) * 100) : 0;
    const normStats = norms.map((norm) => {
      const nc = controls.filter((c) => c.normId === norm.id);
      const ni = nc.filter((c) => c.status === 'Implemented').length;
      const pct = nc.length ? Math.round((ni / nc.length) * 100) : 0;
      return { ...norm, total: nc.length, implemented: ni, pct };
    });
    return { total, implemented, overallRate, normStats };
  }, [norms, controls]);

  if (!stats) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-brand-300 text-sm">{t.common.loading}</p>
    </div>
  );

  const empty = stats.total === 0;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-brand-500 dark:text-white tracking-tight">{t.dashboard.title}</h1>
        <p className="text-sm text-brand-400 dark:text-brand-300 mt-1 font-normal">{t.dashboard.subtitle}</p>
      </div>

      {empty && (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-brand-200 dark:border-brand-700 rounded-2xl bg-white dark:bg-brand-800 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-700 flex items-center justify-center mb-5">
            <BarChart3 className="h-8 w-8 text-brand-300" aria-hidden="true" />
          </div>
          <p className="text-brand-400 dark:text-brand-300 font-medium mb-1">{t.dashboard.empty}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 flex items-center gap-1.5 text-sm text-azure-500 hover:text-azure-700 font-medium transition-colors"
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
              icon={<ShieldCheck className="h-5 w-5 text-brand-300" aria-hidden="true" />}
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

          <div className="bg-white dark:bg-brand-800 rounded-xl border border-brand-100 dark:border-brand-700 shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-brand-50 dark:border-brand-700">
              <h2 className="font-semibold text-brand-500 dark:text-white tracking-tight">{t.dashboard.progress}</h2>
            </div>
            <div className="p-6 space-y-5">
              {stats.normStats.map((norm) => (
                <div key={norm.id}>
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={() => navigate(`/norms/${norm.id}`)}
                      className="text-sm font-semibold text-brand-500 dark:text-brand-100 hover:text-azure-500 transition-colors flex items-center gap-1.5 group"
                    >
                      {norm.name}
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                    </button>
                    <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-brand-400">
                      <span>{t.dashboard.progressOf(norm.implemented, norm.total)}</span>
                      <span className="font-bold text-brand-500 dark:text-white w-9 text-right tabular-nums">
                        {norm.pct}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-brand-50 dark:bg-brand-700 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{
                        width: `${norm.pct}%`,
                        backgroundColor: norm.pct === 100 ? '#22c55e' : '#0085CA',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function KpiCard({ label, value, sub, icon, accent }) {
  return (
    <div className={`bg-white dark:bg-brand-800 rounded-xl border border-brand-100 dark:border-brand-700 shadow-card p-5 border-l-4 ${accent}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-brand-300 dark:text-brand-400 uppercase tracking-widest">
          {label}
        </span>
        {icon}
      </div>
      <div className="text-3xl font-bold text-brand-500 dark:text-white tracking-tight">{value}</div>
      {sub && <p className="text-xs text-gray-400 dark:text-brand-400 mt-1 font-normal">{sub}</p>}
    </div>
  );
}
