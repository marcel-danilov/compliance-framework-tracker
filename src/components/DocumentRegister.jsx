import { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { useTranslation } from '../lib/useTranslation';
import {
  Upload, Download, Trash2, FileText, FileSpreadsheet, File,
  Image, Search, Plus, FolderOpen, History, X, Clock,
} from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function FileIcon({ fileName, className }) {
  const ext = (fileName || '').split('.').pop().toLowerCase();
  const Icon =
    ext === 'pdf' ? FileText :
    ['xls', 'xlsx', 'csv'].includes(ext) ? FileSpreadsheet :
    ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext) ? Image :
    File;
  return <Icon className={className} aria-hidden="true" />;
}

function UploadModal({ onClose }) {
  const t = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleFile = (f) => {
    setFile(f);
    if (!name) setName(f.name.replace(/\.[^.]+$/, ''));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const submit = async () => {
    if (!name.trim() || !file) return;
    setLoading(true);
    const buf = await file.arrayBuffer();
    const blob = new Blob([buf], { type: file.type });
    const docId = await db.documents.add({
      name: name.trim(),
      description: description.trim(),
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileData: blob,
      uploadedAt: new Date().toISOString(),
      currentVersion: 1,
    });
    await db.documentVersions.add({
      documentId: docId,
      versionNumber: 1,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileData: blob,
      uploadedAt: new Date().toISOString(),
      comment: '',
    });
    setLoading(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(30,22,16,0.40)', backdropFilter: 'blur(6px)' }}
    >
      <div className="glass-modal rounded-2xl w-full max-w-lg p-6 shadow-modal">
        <h2 className="font-semibold text-brand-800 dark:text-brand-100 mb-1 tracking-tight">{t.uploadModal.title}</h2>
        <p className="text-sm text-brand-400 dark:text-brand-400 mb-5">{t.uploadModal.subtitle}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-400 dark:text-brand-300 uppercase tracking-widest mb-1.5">
              {t.uploadModal.nameLabel} <span className="text-red-400">{t.uploadModal.nameRequired}</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Název dokumentu"
              className="w-full border border-brand-200/60 dark:border-brand-600/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-azure-400/50 focus:border-azure-400 text-brand-700 dark:text-brand-100 bg-white/60 dark:bg-brand-700/50 backdrop-blur-sm placeholder-brand-300 dark:placeholder-brand-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-400 dark:text-brand-300 uppercase tracking-widest mb-1.5">
              {t.uploadModal.descriptionLabel}{' '}
              <span className="text-brand-200 dark:text-brand-500 font-normal normal-case">{t.uploadModal.descriptionOptional}</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Stručný popis dokumentu"
              className="w-full border border-brand-200/60 dark:border-brand-600/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-azure-400/50 focus:border-azure-400 text-brand-700 dark:text-brand-100 bg-white/60 dark:bg-brand-700/50 backdrop-blur-sm placeholder-brand-300 dark:placeholder-brand-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-400 dark:text-brand-300 uppercase tracking-widest mb-1.5">
              {t.uploadModal.fileLabel} <span className="text-red-400">{t.uploadModal.fileRequired}</span>
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current.click()}
              className={`border-2 border-dashed rounded-xl px-4 py-7 text-center cursor-pointer transition-colors ${
                dragging
                  ? 'border-azure-400 bg-azure-50/60 dark:bg-azure-900/20'
                  : 'border-brand-200/50 dark:border-brand-600/50 hover:border-azure-300 hover:bg-brand-50/50 dark:hover:bg-brand-700/40'
              }`}
            >
              {file ? (
                <div className="flex items-center justify-center gap-2.5">
                  <FileIcon fileName={file.name} className="h-5 w-5 text-azure-500" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-brand-500 dark:text-white">{file.name}</p>
                    <p className="text-xs text-brand-300 dark:text-brand-400 mt-0.5">{formatSize(file.size)}</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="h-5 w-5 text-brand-200 dark:text-brand-500 mx-auto mb-2" aria-hidden="true" />
                  <p className="text-sm text-brand-400 dark:text-brand-300">{t.uploadModal.dropZoneText}</p>
                  <p className="text-xs text-brand-200 dark:text-brand-500 mt-1">{t.uploadModal.dropZoneHint}</p>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2.5 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-brand-400 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-100 font-medium transition-colors"
          >
            {t.common.cancel}
          </button>
          <button
            onClick={submit}
            disabled={!name.trim() || !file || loading}
            className="px-4 py-2 text-sm font-semibold rounded-xl text-white bg-azure-500 hover:bg-azure-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? t.uploadModal.uploadingBtn : t.uploadModal.uploadBtn}
          </button>
        </div>
      </div>
    </div>
  );
}

function NewVersionModal({ doc, onClose }) {
  const t = useTranslation();
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState('');
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const submit = async () => {
    if (!file) return;
    setLoading(true);
    const buf = await file.arrayBuffer();
    const blob = new Blob([buf], { type: file.type });
    const nextVersion = (doc.currentVersion || 1) + 1;
    const now = new Date().toISOString();

    await db.documentVersions.add({
      documentId: doc.id,
      versionNumber: nextVersion,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileData: blob,
      uploadedAt: now,
      comment: comment.trim(),
    });

    await db.documents.update(doc.id, {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileData: blob,
      uploadedAt: now,
      currentVersion: nextVersion,
    });

    setLoading(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(30,22,16,0.40)', backdropFilter: 'blur(6px)' }}
    >
      <div className="glass-modal rounded-2xl w-full max-w-md p-6 shadow-modal">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-semibold text-brand-800 dark:text-brand-100 tracking-tight">{t.docVersions.uploadNew}</h2>
            <p className="text-xs text-brand-400 dark:text-brand-400 mt-0.5 truncate max-w-xs">{doc.name}</p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 bg-azure-50 dark:bg-azure-900/30 text-azure-600 dark:text-azure-300 rounded-full border border-azure-100 dark:border-azure-800">
            {t.docVersions.version((doc.currentVersion || 1) + 1)}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current.click()}
              className={`border-2 border-dashed rounded-xl px-4 py-6 text-center cursor-pointer transition-colors ${
                dragging
                  ? 'border-azure-400 bg-azure-50/60 dark:bg-azure-900/20'
                  : 'border-brand-200/50 dark:border-brand-600/50 hover:border-azure-300 hover:bg-brand-50/50 dark:hover:bg-brand-700/40'
              }`}
            >
              {file ? (
                <div className="flex items-center justify-center gap-2.5">
                  <FileIcon fileName={file.name} className="h-5 w-5 text-azure-500" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-brand-500 dark:text-white">{file.name}</p>
                    <p className="text-xs text-brand-300 dark:text-brand-400 mt-0.5">{formatSize(file.size)}</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="h-5 w-5 text-brand-200 dark:text-brand-500 mx-auto mb-2" aria-hidden="true" />
                  <p className="text-sm text-brand-400 dark:text-brand-300">{t.uploadModal.dropZoneText}</p>
                  <p className="text-xs text-brand-200 dark:text-brand-500 mt-1">{t.uploadModal.dropZoneHint}</p>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => e.target.files[0] && setFile(e.target.files[0])}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-400 dark:text-brand-300 uppercase tracking-widest mb-1.5">
              {t.docVersions.comment}
            </label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t.docVersions.commentPlaceholder}
              className="w-full border border-brand-200/60 dark:border-brand-600/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-azure-400/50 focus:border-azure-400 text-brand-700 dark:text-brand-100 bg-white/60 dark:bg-brand-700/50 backdrop-blur-sm placeholder-brand-300 dark:placeholder-brand-500 transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2.5 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-brand-400 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-100 font-medium transition-colors"
          >
            {t.common.cancel}
          </button>
          <button
            onClick={submit}
            disabled={!file || loading}
            className="px-4 py-2 text-sm font-semibold rounded-xl text-white bg-azure-500 hover:bg-azure-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? t.docVersions.uploadingBtn : t.docVersions.uploadBtn}
          </button>
        </div>
      </div>
    </div>
  );
}

function VersionHistoryModal({ doc, onClose }) {
  const t = useTranslation();
  const versions = useLiveQuery(
    () => db.documentVersions.where('documentId').equals(doc.id).sortBy('versionNumber'),
    [doc.id]
  );

  const downloadVersion = (v) => {
    const url = URL.createObjectURL(v.fileData);
    const a = document.createElement('a');
    a.href = url;
    a.download = v.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(30,22,16,0.40)', backdropFilter: 'blur(6px)' }}
    >
      <div className="glass-modal rounded-2xl w-full max-w-lg flex flex-col max-h-[80vh] shadow-modal">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-brand-200/40 dark:border-brand-700/40">
          <div>
            <h2 className="font-semibold text-brand-800 dark:text-brand-100 tracking-tight flex items-center gap-2">
              <History className="h-4 w-4 text-brand-400" aria-hidden="true" />
              {t.docVersions.history}
            </h2>
            <p className="text-xs text-brand-400 dark:text-brand-400 mt-0.5 truncate max-w-xs">{doc.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-brand-400 hover:text-brand-700 dark:hover:text-brand-100 transition-colors p-1 rounded-lg hover:bg-brand-100/50 dark:hover:bg-brand-700/50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Version list */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!versions || versions.length === 0 ? (
            <p className="text-sm text-brand-300 dark:text-brand-400 text-center py-8">{t.docVersions.noVersions}</p>
          ) : (
            <div className="space-y-2">
              {[...versions].reverse().map((v) => {
                const isCurrent = v.versionNumber === (doc.currentVersion || 1);
                return (
                  <div
                    key={v.id}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors ${
                      isCurrent
                        ? 'border-azure-200 dark:border-azure-800 bg-azure-50/50 dark:bg-azure-900/15'
                        : 'border-brand-200/40 dark:border-brand-700/40 hover:bg-brand-50/40 dark:hover:bg-brand-700/30'
                    }`}
                  >
                    {/* Version badge */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold ${
                      isCurrent
                        ? 'bg-azure-500 text-white'
                        : 'bg-brand-100/60 dark:bg-brand-700/60 text-brand-400 dark:text-brand-300'
                    }`}>
                      {t.docVersions.version(v.versionNumber)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-brand-500 dark:text-brand-100 truncate">{v.fileName}</p>
                        {isCurrent && (
                          <span className="text-xs px-1.5 py-0.5 bg-azure-100 dark:bg-azure-900/30 text-azure-600 dark:text-azure-300 rounded-full font-medium flex-shrink-0">
                            {t.docVersions.current}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-brand-300 dark:text-brand-500">
                        <Clock className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                        <span>{new Date(v.uploadedAt).toLocaleString('cs-CZ')}</span>
                        {v.fileSize && <span>· {formatSize(v.fileSize)}</span>}
                      </div>
                      {v.comment && (
                        <p className="mt-1 text-xs text-brand-400 dark:text-brand-400 italic">{v.comment}</p>
                      )}
                    </div>

                    <button
                      onClick={() => downloadVersion(v)}
                      title={t.docVersions.downloadVersion(v.versionNumber)}
                      className="flex-shrink-0 p-1.5 text-brand-300 hover:text-azure-500 rounded-lg hover:bg-azure-50 dark:hover:bg-azure-900/20 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-brand-200/40 dark:border-brand-700/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-brand-500 dark:text-brand-200 hover:text-brand-700 dark:hover:text-white transition-colors"
          >
            {t.docVersions.closeHistory}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DocumentRegister() {
  const t = useTranslation();
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [newVersionFor, setNewVersionFor] = useState(null);
  const [historyFor, setHistoryFor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const documents = useLiveQuery(() => db.documents.orderBy('name').toArray(), []);

  const linkCounts = useLiveQuery(
    () =>
      db.controlDocuments.toArray().then((links) => {
        const counts = {};
        links.forEach((l) => {
          counts[l.documentId] = (counts[l.documentId] || 0) + 1;
        });
        return counts;
      }),
    []
  );

  const filtered = (documents || []).filter(
    (d) =>
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.fileName.toLowerCase().includes(search.toLowerCase())
  );

  const downloadDoc = (doc) => {
    const url = URL.createObjectURL(doc.fileData);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await db.controlDocuments.where('documentId').equals(deleteTarget.id).delete();
    await db.documentVersions.where('documentId').equals(deleteTarget.id).delete();
    await db.documents.delete(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-800 dark:text-brand-100 tracking-tight mb-1">{t.documentRegister.title}</h1>
          <p className="text-sm text-brand-400 dark:text-brand-400">{t.documentRegister.subtitle}</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 bg-azure-500 text-white text-sm font-semibold rounded-xl hover:bg-azure-600 active:scale-95 transition-all"
          style={{ boxShadow: '0 1px 3px 0 rgba(0,96,122,0.06)' }}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t.documentRegister.uploadBtn}
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-200 dark:text-brand-500 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.documentRegister.searchPlaceholder}
          className="w-full pl-9 pr-3 py-2 border border-brand-200/60 dark:border-brand-700/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-azure-400/50 focus:border-azure-400 bg-white/60 dark:bg-brand-800/50 backdrop-blur-sm text-brand-700 dark:text-brand-100 placeholder-brand-300 dark:placeholder-brand-500"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <FolderOpen className="h-10 w-10 text-brand-100 dark:text-brand-700 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm font-medium text-brand-300 dark:text-brand-400">
            {search ? t.documentRegister.emptySearch : t.documentRegister.empty}
          </p>
          {!search && (
            <button
              onClick={() => setShowUpload(true)}
              className="mt-3 text-sm text-azure-500 hover:text-azure-600 font-medium transition-colors"
            >
              {t.documentRegister.uploadFirst}
            </button>
          )}
        </div>
      ) : (
        <div className="glass-card shadow-glass rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-200/40 dark:border-brand-700/40 bg-brand-50/40 dark:bg-brand-900/30">
                <th className="text-left text-xs font-semibold text-brand-400 uppercase tracking-widest px-5 py-3.5">
                  {t.documentRegister.columns.name}
                </th>
                <th className="text-left text-xs font-semibold text-brand-400 uppercase tracking-widest px-4 py-3.5 hidden sm:table-cell">
                  {t.documentRegister.columns.file}
                </th>
                <th className="text-left text-xs font-semibold text-brand-400 uppercase tracking-widest px-4 py-3.5 hidden md:table-cell">
                  {t.documentRegister.columns.added}
                </th>
                <th className="text-left text-xs font-semibold text-brand-400 uppercase tracking-widest px-4 py-3.5 hidden lg:table-cell">
                  {t.documentRegister.columns.usage}
                </th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100/50 dark:divide-brand-700/40">
              {filtered.map((doc) => {
                const count = (linkCounts || {})[doc.id] || 0;
                const version = doc.currentVersion || 1;
                return (
                  <tr key={doc.id} className="hover:bg-brand-50/40 dark:hover:bg-brand-700/30 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-100/60 dark:bg-brand-700/60 flex items-center justify-center flex-shrink-0">
                          <FileIcon fileName={doc.fileName} className="h-4 w-4 text-brand-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-brand-700 dark:text-brand-100 truncate">{doc.name}</p>
                            {version > 1 && (
                              <span className="text-xs px-1.5 py-0.5 bg-brand-100/60 dark:bg-brand-700/60 text-brand-500 dark:text-brand-300 rounded-full border border-brand-200/50 dark:border-brand-600/50 font-medium flex-shrink-0 tabular-nums">
                                {t.docVersions.version(version)}
                              </span>
                            )}
                          </div>
                          {doc.description && (
                            <p className="text-xs text-brand-400 dark:text-brand-400 truncate mt-0.5">{doc.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <p className="text-xs text-brand-500 dark:text-brand-300 truncate max-w-[180px]">{doc.fileName}</p>
                      <p className="text-xs text-brand-300 dark:text-brand-500 mt-0.5">{formatSize(doc.fileSize)}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <p className="text-xs text-brand-300 dark:text-brand-400">
                        {new Date(doc.uploadedAt).toLocaleDateString('cs-CZ')}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className={`text-xs ${count > 0 ? 'text-azure-600 dark:text-azure-400 font-medium' : 'text-brand-200 dark:text-brand-600'}`}>
                        {count === 0
                          ? t.documentRegister.usage.unused
                          : count === 1
                            ? t.documentRegister.usage.singular
                            : count <= 4
                              ? t.documentRegister.usage.few(count)
                              : t.documentRegister.usage.many(count)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setHistoryFor(doc)}
                          title={t.docVersions.history}
                          className="p-1.5 text-brand-300 hover:text-brand-500 dark:hover:text-white rounded-lg hover:bg-brand-50 dark:hover:bg-brand-700 transition-colors"
                        >
                          <History className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => setNewVersionFor(doc)}
                          title={t.docVersions.uploadNew}
                          className="p-1.5 text-brand-300 hover:text-azure-500 rounded-lg hover:bg-azure-50 dark:hover:bg-azure-900/20 transition-colors"
                        >
                          <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => downloadDoc(doc)}
                          title={t.documentRegister.downloadAriaLabel}
                          className="p-1.5 text-brand-300 hover:text-azure-500 rounded-lg hover:bg-azure-50 dark:hover:bg-azure-900/20 transition-colors"
                        >
                          <Download className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(doc)}
                          title={t.documentRegister.deleteAriaLabel}
                          className="p-1.5 text-brand-300 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      {newVersionFor && <NewVersionModal doc={newVersionFor} onClose={() => setNewVersionFor(null)} />}
      {historyFor && <VersionHistoryModal doc={historyFor} onClose={() => setHistoryFor(null)} />}

      <ConfirmDialog
        open={!!deleteTarget}
        title={t.documentRegister.deleteConfirmTitle}
        message={
          deleteTarget
            ? t.documentRegister.deleteConfirmMessage(deleteTarget.name)
            : ''
        }
        confirmLabel={t.common.delete}
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
