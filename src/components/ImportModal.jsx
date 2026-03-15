import { useState, useRef } from 'react';
import { db } from '../lib/db';
import { parseCSV } from '../lib/csvUtils';
import { useTranslation } from '../lib/useTranslation';
import { X, Upload, AlertCircle, CheckCircle2, FileText } from 'lucide-react';

const REQUIRED = ['id', 'name', 'description'];

export default function ImportModal({ onClose }) {
  const t = useTranslation();
  const [step, setStep] = useState('form');
  const [normName, setNormName] = useState('');
  const [normDesc, setNormDesc] = useState('');
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setError('');
    try {
      const result = await parseCSV(f);
      setParsed(result);
    } catch {
      setError('Nepodařilo se načíst CSV soubor.');
    }
  };

  const handlePreview = async () => {
    if (!normName.trim()) return setError('Název normy je povinný.');
    if (!parsed) return setError('Prosím nahrajte CSV soubor.');
    const cols = parsed.meta.fields || [];
    const missing = REQUIRED.filter((c) => !cols.includes(c));
    if (missing.length) return setError(`Chybějící povinné sloupce: ${missing.join(', ')}`);
    const existing = await db.norms.where('name').equalsIgnoreCase(normName.trim()).first();
    if (existing) { setConflict(existing); return; }
    setError('');
    setStep('preview');
  };

  const doImport = async (overwrite = false) => {
    setLoading(true);
    setError('');
    try {
      const now = new Date().toISOString();
      let normId;
      if (overwrite && conflict) {
        await db.controls.where('normId').equals(conflict.id).delete();
        await db.norms.update(conflict.id, { name: normName.trim(), description: normDesc.trim(), updatedAt: now });
        normId = conflict.id;
      } else {
        normId = await db.norms.add({ name: normName.trim(), description: normDesc.trim(), createdAt: now, updatedAt: now });
      }
      let imported = 0, skipped = 0;
      const skippedRows = [];
      for (let i = 0; i < parsed.data.length; i++) {
        const row = parsed.data[i];
        const missing = REQUIRED.filter((f) => !row[f]?.trim());
        if (missing.length) { skipped++; skippedRows.push({ row: i + 2, reason: `Chybí: ${missing.join(', ')}` }); continue; }
        await db.controls.add({
          normId, controlId: row.id.trim(), name: row.name.trim(), description: row.description.trim(),
          category: row.category?.trim() || '', status: 'Not Started', notes: '', updatedAt: now,
        });
        imported++;
      }
      setImportResult({ imported, skipped, skippedRows });
      setStep('result');
      setConflict(null);
    } catch (err) {
      setError('Import selhal: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const previewRows = parsed?.data?.slice(0, 5) ?? [];
  const cols = parsed?.meta?.fields ?? [];

  const STEP_LABELS = {
    form:    t.importModal.step1,
    preview: t.importModal.step2,
    result:  t.importModal.step3,
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
         style={{ backgroundColor: 'rgba(0,31,42,0.35)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white dark:bg-brand-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-brand-100 dark:border-brand-700"
           style={{ boxShadow: '0 20px 60px 0 rgba(0,31,42,0.22)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-100 dark:border-brand-700">
          <div>
            <h2 className="text-base font-semibold text-brand-500 dark:text-white tracking-tight">
              {STEP_LABELS[step]}
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              {['form', 'preview', 'result'].map((s, i) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full transition-all ${
                    step === s ? 'bg-azure-500' : ['form','preview','result'].indexOf(step) > i ? 'bg-green-500' : 'bg-brand-200 dark:bg-brand-600'
                  }`} />
                  {i < 2 && <div className="w-4 h-px bg-brand-100 dark:bg-brand-700" />}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-brand-300 hover:text-brand-500 dark:hover:text-white transition-colors p-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-700"
            aria-label="Zavřít"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {step === 'form' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-brand-400 dark:text-brand-300 uppercase tracking-widest mb-1.5">
                  {t.importModal.nameLabel} <span className="text-red-400 normal-case">*</span>
                </label>
                <input
                  type="text"
                  value={normName}
                  onChange={(e) => { setNormName(e.target.value); setError(''); setConflict(null); }}
                  placeholder="např. ISO 27001, SOC 2, NIST CSF"
                  className="w-full border border-brand-200 dark:border-brand-600 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-azure-400/50 focus:border-azure-400 text-brand-500 dark:text-brand-100 dark:bg-brand-700 placeholder-brand-200 dark:placeholder-brand-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-400 dark:text-brand-300 uppercase tracking-widest mb-1.5">
                  {t.importModal.descriptionLabel} <span className="text-brand-300 dark:text-brand-500 normal-case font-normal">{t.importModal.descriptionOptional}</span>
                </label>
                <textarea
                  value={normDesc}
                  onChange={(e) => setNormDesc(e.target.value)}
                  rows={2}
                  placeholder="Stručný popis tohoto rámce shody"
                  className="w-full border border-brand-200 dark:border-brand-600 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-azure-400/50 focus:border-azure-400 resize-none text-brand-500 dark:text-brand-100 dark:bg-brand-700 placeholder-brand-200 dark:placeholder-brand-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-400 dark:text-brand-300 uppercase tracking-widest mb-1.5">
                  {t.importModal.fileLabel} <span className="text-red-400 normal-case">*</span>
                </label>
                <div
                  onClick={() => fileRef.current.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-150 ${
                    file
                      ? 'border-azure-300 bg-azure-50 dark:bg-azure-900/20'
                      : 'border-brand-200 dark:border-brand-600 hover:border-azure-400 hover:bg-brand-50 dark:hover:bg-brand-700'
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && fileRef.current.click()}
                  aria-label="Nahrát CSV soubor"
                >
                  {file ? (
                    <>
                      <FileText className="h-8 w-8 text-azure-400 mx-auto mb-2" aria-hidden="true" />
                      <p className="text-sm font-semibold text-brand-500 dark:text-white">{file.name}</p>
                      <p className="text-xs text-brand-300 dark:text-brand-400 mt-1">{parsed?.data?.length ?? 0} datových řádků</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-brand-200 dark:text-brand-500 mx-auto mb-2" aria-hidden="true" />
                      <p className="text-sm font-medium text-brand-400 dark:text-brand-300">{t.importModal.dropZoneText}</p>
                      <p className="text-xs text-brand-300 dark:text-brand-500 mt-1">{t.importModal.dropZoneHint}</p>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
              </div>

              {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-800">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  {error}
                </div>
              )}

              {conflict && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-800 dark:text-amber-300">
                  <p className="font-semibold mb-0.5">
                    {t.importModal.conflictMessage(conflict.name)}
                  </p>
                  <p className="text-amber-600 dark:text-amber-400 mb-3 text-xs">Přepsáním dojde k nahrazení všech stávajících kontrol.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setConflict(null); setStep('preview'); }}
                      className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 active:scale-95 transition-all"
                    >
                      {t.importModal.overwrite}
                    </button>
                    <button
                      onClick={() => setConflict(null)}
                      className="px-3 py-1.5 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-medium hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors"
                    >
                      {t.importModal.cancelBtn}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {step === 'preview' && (
            <>
              <p className="text-sm text-gray-500 dark:text-brand-400 leading-relaxed">
                {t.importModal.preview(parsed.data.length, Math.min(5, previewRows.length), normName)}
              </p>

              <div className="overflow-x-auto border border-brand-100 dark:border-brand-700 rounded-xl">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-brand-50 dark:bg-brand-900">
                      {cols.slice(0, 6).map((col) => (
                        <th key={col} className="border-b border-brand-100 dark:border-brand-700 px-3 py-2.5 text-left font-semibold text-brand-400 dark:text-brand-300 uppercase tracking-widest">
                          {col}
                          {REQUIRED.includes(col) && <span className="text-red-400 ml-0.5">*</span>}
                        </th>
                      ))}
                      {cols.length > 6 && (
                        <th className="border-b border-brand-100 dark:border-brand-700 px-3 py-2.5 text-brand-300 dark:text-brand-500">
                          +{cols.length - 6} dalších
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, i) => (
                      <tr key={i} className="even:bg-brand-50/50 dark:even:bg-brand-700/30">
                        {cols.slice(0, 6).map((col) => (
                          <td key={col} className="border-b border-brand-50 dark:border-brand-700 px-3 py-2.5 max-w-[12rem] truncate text-gray-600 dark:text-brand-300">
                            {row[col] || <span className="text-brand-200 dark:text-brand-600">—</span>}
                          </td>
                        ))}
                        {cols.length > 6 && <td className="border-b border-brand-50 dark:border-brand-700 px-3 py-2.5" />}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-800">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  {error}
                </div>
              )}
            </>
          )}

          {step === 'result' && importResult && (
            <>
              <div className="flex items-center gap-3.5 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-300">{t.importModal.resultTitle}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {t.importModal.resultMessage(importResult.imported)}
                    {importResult.skipped > 0 && `, ${importResult.skipped} ${importResult.skipped === 1 ? 'řádek přeskočen' : 'řádky přeskočeny'}`}
                  </p>
                </div>
              </div>

              {importResult.skippedRows.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-brand-400 dark:text-brand-300 uppercase tracking-widest mb-2">{t.importModal.skippedRows}</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto text-xs text-gray-500 dark:text-brand-400 border border-brand-100 dark:border-brand-700 rounded-xl p-3">
                    {importResult.skippedRows.map((r, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="text-brand-300 dark:text-brand-500 w-16 flex-shrink-0 tabular-nums">{t.importModal.rowError(r.row)}</span>
                        <span>{r.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-brand-100 dark:border-brand-700">
          {step === 'form' && (
            <>
              <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 dark:text-brand-400 hover:text-brand-500 dark:hover:text-white font-medium transition-colors">
                {t.importModal.cancelBtn}
              </button>
              <button
                onClick={handlePreview}
                disabled={!normName.trim() || !file || loading}
                className="px-4 py-2 text-sm font-semibold bg-azure-500 text-white rounded-xl hover:bg-azure-600 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
              >
                {t.importModal.previewBtn}
              </button>
            </>
          )}
          {step === 'preview' && (
            <>
              <button onClick={() => setStep('form')} className="px-4 py-2 text-sm text-gray-400 dark:text-brand-400 hover:text-brand-500 dark:hover:text-white font-medium transition-colors">
                {t.importModal.prevBtn}
              </button>
              <button
                onClick={() => doImport(!!conflict)}
                disabled={loading}
                className="px-4 py-2 text-sm font-semibold bg-azure-500 text-white rounded-xl hover:bg-azure-600 disabled:opacity-40 active:scale-95 transition-all"
              >
                {loading ? 'Importování…' : t.importModal.importBtn(parsed?.data?.length ?? 0)}
              </button>
            </>
          )}
          {step === 'result' && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold bg-azure-500 text-white rounded-xl hover:bg-azure-600 active:scale-95 transition-all"
            >
              {t.importModal.doneBtn}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
