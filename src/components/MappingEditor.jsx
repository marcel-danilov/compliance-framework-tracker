import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/db';
import { useTranslation } from '../lib/useTranslation';
import StatusBadge from './StatusBadge';
import { Plus, X, ArrowRight } from 'lucide-react';

const MAPPING_TYPES = ['Equivalent', 'Partially covers', 'Related'];

const TYPE_STYLES = {
  Equivalent:         'bg-indigo-100/80 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  'Partially covers': 'bg-amber-100/80 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  Related:            'bg-stone-100/80 text-stone-600 dark:bg-stone-800/50 dark:text-stone-300',
};

export default function MappingEditor({ normId, controls, preselectControlA }) {
  const t = useTranslation();
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(!!preselectControlA);
  const [formControlA, setFormControlA] = useState(preselectControlA ? String(preselectControlA) : '');
  const [formNormB, setFormNormB] = useState('');
  const [formControlB, setFormControlB] = useState('');
  const [formType, setFormType] = useState('Equivalent');

  const controlIds = useMemo(() => controls?.map((c) => c.id) ?? [], [controls]);

  const allNorms = useLiveQuery(() => db.norms.toArray(), []);
  const allControls = useLiveQuery(() => db.controls.toArray(), []);

  const rawMappings = useLiveQuery(async () => {
    if (!controlIds.length) return [];
    const [asA, asB] = await Promise.all([
      db.controlMappings.where('controlIdA').anyOf(controlIds).toArray(),
      db.controlMappings.where('controlIdB').anyOf(controlIds).toArray(),
    ]);
    const seen = new Set();
    return [...asA, ...asB].filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [controlIds]);

  const mappings = useMemo(() => {
    if (!rawMappings || !allControls || !allNorms || !controls) return [];
    const controlMap = Object.fromEntries(allControls.map((c) => [c.id, c]));
    const normMap = Object.fromEntries(allNorms.map((n) => [n.id, n]));
    const thisIds = new Set(controlIds);
    return rawMappings.map((m) => {
      const isA = thisIds.has(m.controlIdA);
      const thisCtrl = controlMap[isA ? m.controlIdA : m.controlIdB];
      const otherCtrl = controlMap[isA ? m.controlIdB : m.controlIdA];
      const otherNorm = otherCtrl ? normMap[otherCtrl.normId] : null;
      return { ...m, thisCtrl, otherCtrl, otherNorm };
    }).filter((m) => m.thisCtrl && m.otherCtrl);
  }, [rawMappings, allControls, allNorms, controls, controlIds]);

  const otherNorms = useMemo(
    () => (allNorms ?? []).filter((n) => n.id !== normId),
    [allNorms, normId]
  );

  const targetControls = useMemo(
    () => (allControls ?? []).filter((c) => c.normId === parseInt(formNormB, 10)),
    [allControls, formNormB]
  );

  const resetForm = () => {
    setFormControlA('');
    setFormNormB('');
    setFormControlB('');
    setFormType('Equivalent');
    setShowForm(false);
  };

  const saveMapping = async () => {
    if (!formControlA || !formControlB) return;
    await db.controlMappings.add({
      controlIdA: parseInt(formControlA, 10),
      controlIdB: parseInt(formControlB, 10),
      type: formType,
      createdAt: new Date().toISOString(),
    });
    resetForm();
  };

  const deleteMapping = (id) => db.controlMappings.delete(id);

  const selectClass = 'w-full text-xs border border-brand-200 dark:border-brand-600 rounded-lg px-2 py-1.5 bg-white/70 dark:bg-brand-800/60 text-brand-700 dark:text-brand-100 focus:outline-none focus:ring-2 focus:ring-azure-400/50 focus:border-azure-400 transition-all';

  return (
    <div className="flex-1 overflow-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-semibold text-brand-800 dark:text-brand-100 tracking-tight">
            {t.mappings.title}
          </h2>
          <p className="text-xs text-brand-400 dark:text-brand-400 mt-0.5">{t.mappings.subtitle}</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-azure-500 hover:bg-azure-600 rounded-lg active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t.mappings.addBtn}
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="glass-card shadow-glass rounded-xl p-5 mb-5">
          <h3 className="text-sm font-semibold text-brand-700 dark:text-brand-100 mb-4">
            {t.mappings.form.title}
          </h3>

          {otherNorms.length === 0 ? (
            <p className="text-sm text-brand-400 dark:text-brand-400 py-2 mb-4">
              {t.mappings.noOtherNorms}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-brand-500 dark:text-brand-400 mb-1">
                  {t.mappings.form.controlA}
                </label>
                <select value={formControlA} onChange={(e) => setFormControlA(e.target.value)} className={selectClass}>
                  <option value="">{t.mappings.form.selectControl}</option>
                  {controls?.map((c) => (
                    <option key={c.id} value={c.id}>{c.controlId} — {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-brand-500 dark:text-brand-400 mb-1">
                  {t.mappings.form.type}
                </label>
                <select value={formType} onChange={(e) => setFormType(e.target.value)} className={selectClass}>
                  {MAPPING_TYPES.map((type) => (
                    <option key={type} value={type}>{t.mappings.types[type]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-brand-500 dark:text-brand-400 mb-1">
                  {t.mappings.form.normB}
                </label>
                <select
                  value={formNormB}
                  onChange={(e) => { setFormNormB(e.target.value); setFormControlB(''); }}
                  className={selectClass}
                >
                  <option value="">{t.mappings.form.selectNorm}</option>
                  {otherNorms.map((n) => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-brand-500 dark:text-brand-400 mb-1">
                  {t.mappings.form.controlB}
                </label>
                <select
                  value={formControlB}
                  onChange={(e) => setFormControlB(e.target.value)}
                  disabled={!formNormB}
                  className={`${selectClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="">{t.mappings.form.selectControl}</option>
                  {targetControls.map((c) => (
                    <option key={c.id} value={c.id}>{c.controlId} — {c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={resetForm}
              className="px-3 py-1.5 text-xs font-medium text-brand-400 hover:text-brand-700 dark:hover:text-brand-100 transition-colors"
            >
              {t.common.cancel}
            </button>
            {otherNorms.length > 0 && (
              <button
                onClick={saveMapping}
                disabled={!formControlA || !formControlB}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-azure-500 hover:bg-azure-600 rounded-lg active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t.mappings.form.saveBtn}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mappings list */}
      {!mappings || mappings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-brand-200/70 dark:border-brand-700/50 rounded-xl text-center">
          <p className="text-brand-400 dark:text-brand-400 text-sm font-medium mb-1">{t.mappings.empty}</p>
          <p className="text-xs text-brand-300 dark:text-brand-500">{t.mappings.emptyHelp}</p>
        </div>
      ) : (
        <div className="glass-card shadow-glass rounded-xl overflow-hidden">
          <div className="divide-y divide-brand-100/60 dark:divide-brand-700/40">
            {mappings.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-brand-50/40 dark:hover:bg-brand-700/20 transition-colors group"
              >
                {/* This norm's control */}
                <div className="min-w-0 w-40 flex-shrink-0">
                  <code className="text-xs text-brand-500 dark:text-brand-300 font-mono bg-brand-100/60 dark:bg-brand-700/60 px-1.5 py-0.5 rounded border border-brand-200/50 dark:border-brand-600/50">
                    {m.thisCtrl.controlId}
                  </code>
                  <p className="text-xs text-brand-500 dark:text-brand-400 truncate mt-0.5">{m.thisCtrl.name}</p>
                </div>

                {/* Type badge */}
                <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLES[m.type]}`}>
                  {t.mappings.types[m.type]}
                </span>

                <ArrowRight className="h-3.5 w-3.5 text-brand-300 flex-shrink-0" aria-hidden="true" />

                {/* Other norm + control */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                    <span
                      className="text-xs px-1.5 py-0.5 bg-brand-100/60 dark:bg-brand-700/60 text-brand-500 dark:text-brand-300 rounded border border-brand-200/50 dark:border-brand-600/50 font-medium max-w-[120px] truncate"
                      title={m.otherNorm?.name}
                    >
                      {m.otherNorm?.name ?? '—'}
                    </span>
                    <code className="text-xs text-brand-500 dark:text-brand-300 font-mono">
                      {m.otherCtrl.controlId}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-brand-600 dark:text-brand-300 truncate flex-1">{m.otherCtrl.name}</p>
                    <StatusBadge status={m.otherCtrl.status} />
                  </div>
                </div>

                {/* Navigate to other control */}
                <button
                  onClick={() => navigate(`/norms/${m.otherCtrl.normId}?select=${m.otherCtrl.id}`)}
                  className="p-1.5 text-brand-300 hover:text-azure-500 rounded-lg hover:bg-brand-100/50 dark:hover:bg-brand-700/40 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                  title={t.mappings.navigateAriaLabel}
                  aria-label={t.mappings.navigateAriaLabel}
                >
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => deleteMapping(m.id)}
                  className="p-1.5 text-brand-300 hover:text-rose-500 rounded-lg hover:bg-rose-50/50 dark:hover:bg-rose-900/20 transition-colors flex-shrink-0"
                  aria-label={t.mappings.deleteAriaLabel}
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
