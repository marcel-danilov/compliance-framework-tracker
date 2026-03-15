import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { exportNormToCSV } from '../lib/csvUtils';
import { useTranslation } from '../lib/useTranslation';
import ImportModal from './ImportModal';
import ConfirmDialog from './ConfirmDialog';
import { Upload, Download, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function NormList() {
  const t = useTranslation();
  const [showImport, setShowImport] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  const norms = useLiveQuery(() => db.norms.orderBy('createdAt').reverse().toArray(), []);
  const allControls = useLiveQuery(() => db.controls.toArray(), []);

  const normStats = useMemo(() => {
    if (!norms || !allControls) return {};
    const stats = {};
    for (const norm of norms) {
      const nc = allControls.filter((c) => c.normId === norm.id);
      stats[norm.id] = {
        total: nc.length,
        implemented:    nc.filter((c) => c.status === 'Implemented').length,
        inProgress:     nc.filter((c) => c.status === 'In Progress').length,
        notStarted:     nc.filter((c) => c.status === 'Not Started').length,
        notImplemented: nc.filter((c) => c.status === 'Not Implemented').length,
        na:             nc.filter((c) => c.status === 'N/A').length,
      };
    }
    return stats;
  }, [norms, allControls]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await db.controls.where('normId').equals(deleteTarget.id).delete();
    await db.norms.delete(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleExport = async (norm) => {
    const controls = await db.controls.where('normId').equals(norm.id).toArray();
    exportNormToCSV(controls, norm.name);
  };

  if (!norms) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-brand-400 text-sm">{t.common.loading}</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold text-brand-800 dark:text-brand-100 tracking-tight">
            {t.normList.title}
          </h1>
          <p className="text-sm text-brand-500 dark:text-brand-300 mt-1 font-normal">
            {t.normList.subtitle}
          </p>
        </div>
        <button
          onClick={() => setShowImport(true)}
          className="flex items-center gap-2 bg-azure-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-azure-600 active:scale-95 transition-all duration-150 shadow-card"
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          {t.normList.importBtn}
        </button>
      </div>

      {norms.length === 0 && (
        <div className="flex flex-col items-center justify-center py-28 border border-dashed border-brand-200/70 dark:border-brand-700/50 rounded-2xl text-center glass-card shadow-glass">
          <div className="w-16 h-16 rounded-2xl bg-brand-100/80 dark:bg-brand-700/50 flex items-center justify-center mb-5">
            <ShieldCheck className="h-8 w-8 text-brand-400" aria-hidden="true" />
          </div>
          <h3 className="text-base font-semibold text-brand-700 dark:text-brand-100 mb-1.5">{t.normList.empty}</h3>
          <p className="text-sm text-brand-400 dark:text-brand-400 mb-7 max-w-xs leading-relaxed">
            {t.normList.emptyHelp}
          </p>
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 bg-azure-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-azure-600 active:scale-95 transition-all duration-150 shadow-card"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            {t.normList.importFirst}
          </button>
        </div>
      )}

      {norms.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {norms.map((norm) => {
            const s = normStats[norm.id] ?? {};
            const pct = s.total ? Math.round((s.implemented / s.total) * 100) : 0;
            return (
              <div
                key={norm.id}
                className="glass-card shadow-glass hover:shadow-card-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden rounded-xl"
              >
                <div
                  className="h-1 w-full"
                  style={{
                    backgroundColor: pct === 100 ? '#059669' : pct > 0 ? '#2563eb' : '#a8a29e',
                  }}
                />

                <div className="p-5 flex-1">
                  <h3 className="font-semibold text-brand-800 dark:text-brand-100 mb-0.5 tracking-tight">{norm.name}</h3>
                  {norm.description && (
                    <p className="text-sm text-brand-400 dark:text-brand-400 line-clamp-2 mb-4 leading-relaxed">{norm.description}</p>
                  )}
                  {!norm.description && <div className="mb-4" />}

                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-brand-400 dark:text-brand-400 font-normal">{s.total ?? 0} opatření</span>
                    <span className="font-semibold text-brand-700 dark:text-brand-200">{pct}% implementováno</span>
                  </div>

                  <StackedBar stats={s} />

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {s.notStarted > 0 && (
                      <span className="text-xs px-2 py-0.5 bg-brand-100/80 dark:bg-brand-700/60 text-brand-500 dark:text-brand-300 rounded-full font-medium">
                        {s.notStarted} {t.controlList.statusLabels['Not Started']}
                      </span>
                    )}
                    {s.inProgress > 0 && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                        {s.inProgress} {t.controlList.statusLabels['In Progress']}
                      </span>
                    )}
                    {s.implemented > 0 && (
                      <span className="text-xs px-2 py-0.5 bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-full font-medium">
                        {s.implemented} {t.controlList.statusLabels['Implemented']}
                      </span>
                    )}
                    {s.notImplemented > 0 && (
                      <span className="text-xs px-2 py-0.5 bg-rose-100/80 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 rounded-full font-medium">
                        {s.notImplemented} {t.controlList.statusLabels['Not Implemented']}
                      </span>
                    )}
                    {s.na > 0 && (
                      <span className="text-xs px-2 py-0.5 bg-amber-100/80 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-full font-medium">
                        {s.na} {t.controlList.statusLabels['N/A']}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-brand-300 dark:text-brand-500 font-normal">
                    {t.normList.updated} {new Date(norm.updatedAt).toLocaleDateString('cs-CZ')}
                  </p>
                </div>

                <div className="px-5 pb-4 pt-3 flex gap-2 border-t border-brand-200/40 dark:border-brand-700/40">
                  <button
                    onClick={() => navigate(`/norms/${norm.id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-brand-700 dark:bg-brand-700/80 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-brand-800 dark:hover:bg-brand-600 active:scale-95 transition-all duration-150"
                  >
                    {t.normList.open} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => handleExport(norm)}
                    title={t.normList.exportBtn}
                    aria-label={t.normList.exportBtn}
                    className="p-2 text-brand-400 hover:text-brand-700 dark:hover:text-brand-100 hover:bg-brand-100/60 dark:hover:bg-brand-700/50 rounded-lg transition-all duration-150"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(norm)}
                    title={t.normList.deleteNorm}
                    aria-label={t.normList.deleteNorm}
                    className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50/70 dark:hover:bg-red-900/20 rounded-lg transition-all duration-150"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showImport && <ImportModal onClose={() => setShowImport(false)} />}

      <ConfirmDialog
        open={!!deleteTarget}
        title={t.normList.deleteConfirmTitle}
        message={t.normList.deleteConfirmMessage(deleteTarget?.name || '')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmLabel={t.normList.deleteNorm}
        danger
      />
    </div>
  );
}

const SEGMENTS = [
  { key: 'implemented',    color: '#22c55e' },
  { key: 'inProgress',     color: '#3b82f6' },
  { key: 'na',             color: '#f59e0b' },
  { key: 'notImplemented', color: '#ef4444' },
  { key: 'notStarted',     color: '#c4ae93' },
];

function StackedBar({ stats }) {
  const t = useTranslation();
  const total = stats.total || 0;
  if (total === 0) {
    return <div className="h-2 bg-brand-100/60 dark:bg-brand-700/50 rounded-full mb-5" aria-hidden="true" />;
  }
  return (
    <div
      className="flex h-2 rounded-full overflow-hidden mb-5 bg-brand-100/60 dark:bg-brand-700/50"
      role="img"
      aria-label={t.stackedBar.ariaLabel(stats)}
    >
      {SEGMENTS.map(({ key, color }) => {
        const count = stats[key] || 0;
        if (count === 0) return null;
        return (
          <div
            key={key}
            title={`${t.stackedBar.segments[key]}: ${count}`}
            className="h-full transition-all duration-700 first:rounded-l-full last:rounded-r-full"
            style={{ width: `${(count / total) * 100}%`, backgroundColor: color }}
          />
        );
      })}
    </div>
  );
}
