import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { useTranslation } from '../lib/useTranslation';
import {
  X, Save, Check, Clock, CheckCircle2, XCircle, MinusCircle, Circle,
  FileText, FileSpreadsheet, File, Image, Download, Link2, Plus, Unlink,
} from 'lucide-react';

const STATUSES = ['Not Started', 'In Progress', 'Implemented', 'Not Implemented', 'N/A'];

const STATUS_CONFIG = {
  'Not Started': {
    label:    'Nezahájeno',
    icon:     Circle,
    inactive: 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-brand-700',
    active:   'border-gray-400 dark:border-gray-500 bg-gray-50 dark:bg-brand-700 text-gray-700 dark:text-gray-200 ring-2 ring-gray-300 dark:ring-gray-600',
  },
  'In Progress': {
    label:    'Probíhá',
    icon:     Clock,
    inactive: 'border-azure-200 dark:border-azure-800 text-azure-600 dark:text-azure-400 hover:border-azure-300 hover:bg-azure-50 dark:hover:bg-azure-900/20',
    active:   'border-azure-500 bg-azure-50 dark:bg-azure-900/30 text-azure-700 dark:text-azure-300 ring-2 ring-azure-300 dark:ring-azure-700',
  },
  Implemented: {
    label:    'Implementováno',
    icon:     CheckCircle2,
    inactive: 'border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20',
    active:   'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 ring-2 ring-green-300 dark:ring-green-800',
  },
  'Not Implemented': {
    label:    'Neimplementováno',
    icon:     XCircle,
    inactive: 'border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20',
    active:   'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 ring-2 ring-red-300 dark:ring-red-800',
  },
  'N/A': {
    label:    'N/A',
    icon:     MinusCircle,
    inactive: 'border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20',
    active:   'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 ring-2 ring-amber-300 dark:ring-amber-800',
  },
};

function FileTypeIcon({ fileName, className }) {
  const ext = (fileName || '').split('.').pop().toLowerCase();
  const Icon =
    ext === 'pdf' ? FileText :
    ['xls', 'xlsx', 'csv'].includes(ext) ? FileSpreadsheet :
    ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext) ? Image :
    File;
  return <Icon className={className} aria-hidden="true" />;
}

function DocumentPicker({ controlId, linkedIds, onClose }) {
  const t = useTranslation();
  const allDocs = useLiveQuery(() => db.documents.orderBy('name').toArray(), []);
  const [selected, setSelected] = useState(() => new Set(linkedIds));

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const save = async () => {
    await db.controlDocuments.where('controlId').equals(controlId).delete();
    if (selected.size > 0) {
      await db.controlDocuments.bulkAdd(
        [...selected].map((documentId) => ({ controlId, documentId }))
      );
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0,31,42,0.35)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="bg-white dark:bg-brand-800 rounded-2xl w-full max-w-md p-5 border border-brand-100 dark:border-brand-700"
        style={{ boxShadow: '0 20px 60px 0 rgba(0,31,42,0.22)' }}
      >
        <h3 className="font-semibold text-brand-500 dark:text-white mb-1 tracking-tight">{t.documentPicker.title}</h3>
        <p className="text-sm text-brand-300 dark:text-brand-400 mb-4">{t.documentPicker.subtitle}</p>

        {!allDocs || allDocs.length === 0 ? (
          <p className="text-sm text-brand-300 dark:text-brand-400 py-6 text-center">
            {t.documentPicker.empty}
          </p>
        ) : (
          <div className="space-y-1 max-h-64 overflow-y-auto mb-4 -mx-1 px-1">
            {allDocs.map((doc) => (
              <label
                key={doc.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-700 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.has(doc.id)}
                  onChange={() => toggle(doc.id)}
                  className="rounded border-brand-200 dark:border-brand-600 text-azure-500 focus:ring-azure-400 flex-shrink-0"
                />
                <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-700 flex items-center justify-center flex-shrink-0">
                  <FileTypeIcon fileName={doc.fileName} className="h-3.5 w-3.5 text-brand-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-brand-500 dark:text-brand-100 truncate">{doc.name}</p>
                  {doc.description && (
                    <p className="text-xs text-brand-300 dark:text-brand-400 truncate">{doc.description}</p>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2.5 pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 dark:text-brand-400 hover:text-brand-500 dark:hover:text-white font-medium transition-colors"
          >
            {t.common.cancel}
          </button>
          {allDocs && allDocs.length > 0 && (
            <button
              onClick={save}
              className="px-4 py-2 text-sm font-semibold rounded-xl text-white bg-azure-500 hover:bg-azure-600 active:scale-95 transition-all"
            >
              {t.common.confirm}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ControlDetail({ control, onClose }) {
  const t = useTranslation();
  const [status, setStatus] = useState(control.status);
  const [notes, setNotes] = useState(control.notes || '');
  const [saved, setSaved] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const linkedDocs = useLiveQuery(
    async () => {
      const links = await db.controlDocuments.where('controlId').equals(control.id).toArray();
      if (links.length === 0) return [];
      const ids = links.map((l) => l.documentId);
      return db.documents.where('id').anyOf(ids).toArray();
    },
    [control.id]
  );

  const persist = async (overrides = {}) => {
    const payload = { status, notes, ...overrides, updatedAt: new Date().toISOString() };
    await db.controls.update(control.id, payload);
    await db.norms.update(control.normId, { updatedAt: new Date().toISOString() });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const handleStatusClick = (s) => {
    setStatus(s);
    persist({ status: s });
  };

  const downloadDoc = (doc) => {
    const url = URL.createObjectURL(doc.fileData);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const unlinkDoc = async (docId) => {
    const link = await db.controlDocuments
      .where('controlId').equals(control.id)
      .and((l) => l.documentId === docId)
      .first();
    if (link) await db.controlDocuments.delete(link.id);
  };

  return (
    <div className="w-96 border-l border-brand-100 dark:border-brand-700 bg-white dark:bg-brand-800 flex flex-col h-full flex-shrink-0 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-brand-100 dark:border-brand-700 flex items-start gap-3 bg-white dark:bg-brand-800">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <code className="text-xs text-brand-400 dark:text-brand-300 bg-brand-50 dark:bg-brand-700 px-1.5 py-0.5 rounded-md font-mono border border-brand-100 dark:border-brand-600">
              {control.controlId}
            </code>
            {control.category && (
              <span className="text-xs px-1.5 py-0.5 bg-brand-50 dark:bg-brand-700 text-brand-400 dark:text-brand-300 rounded-md border border-brand-100 dark:border-brand-600 font-medium">
                {control.category}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-brand-500 dark:text-white text-sm leading-snug tracking-tight">
            {control.name}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-brand-300 hover:text-brand-500 dark:hover:text-white flex-shrink-0 mt-0.5 transition-colors p-1 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-700"
          aria-label={t.controlList.closePanel}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        {/* Description */}
        <div>
          <p className="text-xs font-semibold text-brand-300 dark:text-brand-400 uppercase tracking-widest mb-2">
            {t.controlDetail.description}
          </p>
          <p className="text-sm text-gray-600 dark:text-brand-300 leading-relaxed">{control.description}</p>
        </div>

        {/* Status */}
        <div>
          <p className="text-xs font-semibold text-brand-300 dark:text-brand-400 uppercase tracking-widest mb-2.5">
            {t.controlDetail.status}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {STATUSES.map((s) => {
              const cfg = STATUS_CONFIG[s];
              const Icon = cfg.icon;
              return (
                <button
                  key={s}
                  onClick={() => handleStatusClick(s)}
                  className={`text-xs px-3 py-2.5 rounded-lg border-2 font-medium transition-all duration-150 text-left flex items-center gap-2 ${
                    status === s ? cfg.active : cfg.inactive
                  }`}
                  aria-pressed={status === s}
                >
                  <Icon className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                  {t.controlDetail.statusConfig[s]?.label ?? cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Documentation */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-semibold text-brand-300 dark:text-brand-400 uppercase tracking-widest">
              {t.controlDetail.documentation}
            </p>
            <button
              onClick={() => setShowPicker(true)}
              className="flex items-center gap-1 text-xs text-azure-500 hover:text-azure-600 font-medium transition-colors"
            >
              <Plus className="h-3 w-3" aria-hidden="true" />
              {t.controlDetail.addDocument}
            </button>
          </div>

          {!linkedDocs || linkedDocs.length === 0 ? (
            <button
              onClick={() => setShowPicker(true)}
              className="w-full border-2 border-dashed border-brand-100 dark:border-brand-600 rounded-xl py-4 text-center text-xs text-brand-300 dark:text-brand-400 hover:border-azure-300 hover:text-azure-500 hover:bg-brand-50 dark:hover:bg-brand-700 transition-colors"
            >
              <Link2 className="h-4 w-4 mx-auto mb-1 opacity-50" aria-hidden="true" />
              {t.controlDetail.assignDocument}
            </button>
          ) : (
            <div className="space-y-1.5">
              {linkedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-2.5 px-3 py-2 bg-brand-50 dark:bg-brand-700 rounded-xl group"
                >
                  <div className="w-6 h-6 rounded-md bg-white dark:bg-brand-800 flex items-center justify-center flex-shrink-0 border border-brand-100 dark:border-brand-600">
                    <FileTypeIcon fileName={doc.fileName} className="h-3 w-3 text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-brand-500 dark:text-brand-100 truncate">{doc.name}</p>
                    {doc.description && (
                      <p className="text-xs text-brand-300 dark:text-brand-400 truncate">{doc.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button
                      onClick={() => downloadDoc(doc)}
                      className="p-1 text-brand-300 hover:text-azure-500 rounded transition-colors"
                      title={t.controlDetail.downloadAriaLabel}
                    >
                      <Download className="h-3 w-3" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => unlinkDoc(doc.id)}
                      className="p-1 text-brand-300 hover:text-red-500 rounded transition-colors"
                      title={t.controlDetail.unlinkAriaLabel}
                    >
                      <Unlink className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setShowPicker(true)}
                className="w-full text-xs text-azure-500 hover:text-azure-600 font-medium py-1.5 transition-colors"
              >
                {t.controlDetail.editDocuments}
              </button>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="control-notes"
            className="block text-xs font-semibold text-brand-300 dark:text-brand-400 uppercase tracking-widest mb-2"
          >
            {t.controlDetail.notes}
          </label>
          <textarea
            id="control-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => persist()}
            rows={6}
            placeholder={t.controlDetail.notesPlaceholder}
            className="w-full border border-brand-100 dark:border-brand-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-azure-400/50 focus:border-azure-400 resize-none text-gray-700 dark:text-brand-100 dark:bg-brand-700 placeholder-brand-200 dark:placeholder-brand-500 transition-all leading-relaxed"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-brand-100 dark:border-brand-700 flex items-center justify-between bg-white dark:bg-brand-800">
        <span className="text-xs text-brand-300 dark:text-brand-400 flex items-center gap-1.5 font-normal">
          {saved ? (
            <>
              <Check className="h-3 w-3 text-green-500" aria-hidden="true" />
              <span className="text-green-600 dark:text-green-400 font-medium">{t.common.saved}</span>
            </>
          ) : (
            t.controlDetail.updated(new Date(control.updatedAt).toLocaleDateString('cs-CZ'))
          )}
        </span>
        <button
          onClick={() => persist()}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-azure-500 text-white text-xs font-semibold rounded-lg hover:bg-azure-600 active:scale-95 transition-all duration-150"
        >
          <Save className="h-3.5 w-3.5" aria-hidden="true" />
          {t.controlDetail.saveBtn}
        </button>
      </div>

      {showPicker && (
        <DocumentPicker
          controlId={control.id}
          linkedIds={(linkedDocs || []).map((d) => d.id)}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
