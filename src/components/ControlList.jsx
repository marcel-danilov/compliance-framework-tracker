import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { exportNormToCSV } from '../lib/csvUtils';
import ControlDetail from './ControlDetail';
import StatusBadge from './StatusBadge';
import { useTranslation } from '../lib/useTranslation';
import {
  ArrowLeft,
  Download,
  Search,
  X,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  FileText,
  FileSpreadsheet,
  File,
  Image,
} from 'lucide-react';

function FileTypeIcon({ fileName, className }) {
  const ext = (fileName || '').split('.').pop().toLowerCase();
  const Icon =
    ext === 'pdf' ? FileText :
    ['xls', 'xlsx', 'csv'].includes(ext) ? FileSpreadsheet :
    ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext) ? Image :
    File;
  return <Icon className={className} aria-hidden="true" />;
}

const STATUSES = ['Not Started', 'In Progress', 'Implemented', 'Not Implemented', 'N/A'];

export default function ControlList() {
  const { normId } = useParams();
  const navigate = useNavigate();
  const t = useTranslation();
  const nId = parseInt(normId, 10);

  const COLS = [
    { key: 'controlId', label: t.controlList.columns.id },
    { key: 'name',      label: t.controlList.columns.name },
    { key: 'category',  label: t.controlList.columns.category },
    { key: 'status',    label: t.controlList.columns.status },
  ];

  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortKey, setSortKey] = useState('controlId');
  const [sortDir, setSortDir] = useState('asc');
  const [selected, setSelected] = useState(new Set());

  const norm = useLiveQuery(() => db.norms.get(nId), [nId]);
  const controls = useLiveQuery(
    () => db.controls.where('normId').equals(nId).toArray(),
    [nId]
  );
  const allLinks = useLiveQuery(() => db.controlDocuments.toArray(), []);
  const allDocs  = useLiveQuery(() => db.documents.toArray(), []);

  const docMap = useMemo(() => {
    if (!allLinks || !allDocs) return {};
    const byId = Object.fromEntries(allDocs.map((d) => [d.id, d]));
    const map = {};
    allLinks.forEach((link) => {
      const doc = byId[link.documentId];
      if (!doc) return;
      if (!map[link.controlId]) map[link.controlId] = [];
      map[link.controlId].push(doc);
    });
    return map;
  }, [allLinks, allDocs]);

  const categories = useMemo(() => {
    if (!controls) return [];
    return [...new Set(controls.map((c) => c.category).filter(Boolean))].sort();
  }, [controls]);

  const filtered = useMemo(() => {
    if (!controls) return [];
    let list = controls;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) => c.controlId.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
      );
    }
    if (statusFilter.length) list = list.filter((c) => statusFilter.includes(c.status));
    if (categoryFilter) list = list.filter((c) => c.category === categoryFilter);
    return [...list].sort((a, b) => {
      const cmp = String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [controls, search, statusFilter, categoryFilter, sortKey, sortDir]);

  const selectedControl = controls?.find((c) => c.id === selectedId) ?? null;

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const toggleStatus = (s) =>
    setStatusFilter((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const clearFilters = () => { setSearch(''); setStatusFilter([]); setCategoryFilter(''); };
  const hasFilters = search || statusFilter.length || categoryFilter;

  // Bulk selection helpers
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allVisibleSelected = filtered.length > 0 && filtered.every((c) => selected.has(c.id));
  const someSelected = filtered.some((c) => selected.has(c.id));

  const toggleAll = () => {
    if (allVisibleSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((c) => next.delete(c.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((c) => next.add(c.id));
        return next;
      });
    }
  };

  const clearSelection = () => setSelected(new Set());

  const bulkUpdateStatus = async (status) => {
    const ids = [...selected];
    await Promise.all(ids.map((id) => db.controls.update(id, { status, updatedAt: new Date().toISOString() })));
    clearSelection();
  };

  const SortIcon = ({ k }) => {
    if (sortKey !== k) return <ChevronsUpDown className="h-3 w-3 text-brand-200" aria-hidden="true" />;
    return sortDir === 'asc'
      ? <ChevronUp className="h-3 w-3 text-azure-500" aria-hidden="true" />
      : <ChevronDown className="h-3 w-3 text-azure-500" aria-hidden="true" />;
  };

  if (!norm || !controls) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-brand-300 text-sm">{t.common.loading}</p>
    </div>
  );

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <div className="px-6 py-3.5 border-b border-brand-200/40 dark:border-brand-700/40 glass-card flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/')}
              className="text-brand-300 hover:text-brand-500 dark:hover:text-white flex-shrink-0 transition-colors p-1 -ml-1 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-700"
              aria-label={t.common.backAriaLabel}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <h1 className="font-semibold text-brand-800 dark:text-brand-100 truncate tracking-tight">{norm.name}</h1>
              <p className="text-xs text-brand-400 dark:text-brand-400 font-normal">{controls.length} kontrol</p>
            </div>
          </div>
          <button
            onClick={() => exportNormToCSV(controls, norm.name)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-brand-600 dark:text-brand-200 border border-brand-200/60 dark:border-brand-600/60 rounded-lg hover:bg-brand-50/70 dark:hover:bg-brand-700/50 active:scale-95 transition-all duration-150 flex-shrink-0 bg-white/50 dark:bg-brand-800/40 backdrop-blur-sm"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {t.common.export}
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-brand-200/30 dark:border-brand-700/30 bg-brand-50/60 dark:bg-brand-900/40 backdrop-blur-sm flex items-center gap-2 flex-wrap flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-300 pointer-events-none" aria-hidden="true" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.controlList.searchPlaceholder}
              aria-label={t.controlList.searchAriaLabel}
              className="pl-8 pr-7 py-1.5 text-xs border border-brand-200/60 dark:border-brand-600/60 rounded-lg bg-white/70 dark:bg-brand-800/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-azure-400/50 focus:border-azure-400 w-48 text-brand-700 dark:text-brand-100 placeholder-brand-300 dark:placeholder-brand-500 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2"
                aria-label={t.controlList.clearSearch}
              >
                <X className="h-3 w-3 text-brand-300 hover:text-brand-500" />
              </button>
            )}
          </div>

          <div className="flex gap-1 flex-wrap">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => toggleStatus(s)}
                aria-pressed={statusFilter.includes(s)}
                className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all duration-150 ${
                  statusFilter.includes(s)
                    ? 'bg-azure-500 text-white border-azure-500 shadow-sm'
                    : 'border-brand-200 dark:border-brand-600 text-brand-400 dark:text-brand-300 hover:border-brand-400 bg-white dark:bg-brand-800 hover:text-brand-600 dark:hover:text-white'
                }`}
              >
                {t.controlList.statusLabels[s]}
              </button>
            ))}
          </div>

          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label={t.controlList.categoryAriaLabel}
              className="text-xs border border-brand-200 dark:border-brand-600 rounded-lg px-2 py-1.5 bg-white dark:bg-brand-800 dark:text-brand-100 focus:outline-none focus:ring-2 focus:ring-azure-400/50 focus:border-azure-400 text-brand-500 transition-all"
            >
              <option value="">{t.controlList.allCategories}</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-azure-500 hover:text-azure-700 font-medium hover:underline transition-colors"
            >
              {t.controlList.clearFilters}
            </button>
          )}

          <span className="ml-auto text-xs text-brand-300 dark:text-brand-500 font-normal tabular-nums">
            {filtered.length} / {controls.length}
          </span>
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="px-6 py-2.5 border-b border-azure-200 dark:border-azure-800 bg-azure-50 dark:bg-azure-900/20 flex items-center gap-3 flex-wrap flex-shrink-0">
            <span className="text-xs font-semibold text-azure-700 dark:text-azure-300">
              {t.bulkEdit.selected(selected.size)}
            </span>
            <span className="text-xs text-azure-500 dark:text-azure-400">{t.bulkEdit.changeStatus}:</span>
            <div className="flex gap-1 flex-wrap">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => bulkUpdateStatus(s)}
                  className="text-xs px-2.5 py-1 rounded-full border border-azure-300 dark:border-azure-700 text-azure-700 dark:text-azure-300 hover:bg-azure-500 hover:text-white hover:border-azure-500 font-medium transition-all duration-150"
                >
                  {t.controlList.statusLabels[s]}
                </button>
              ))}
            </div>
            <button
              onClick={clearSelection}
              className="ml-auto text-xs text-azure-500 hover:text-azure-700 dark:hover:text-azure-300 font-medium flex items-center gap-1 transition-colors"
            >
              <X className="h-3 w-3" />
              {t.bulkEdit.clearSelection}
            </button>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-10 bg-brand-50/80 dark:bg-brand-900/80 backdrop-blur-sm">
              <tr>
                <th className="px-4 py-3 w-10 border-b border-brand-200/40 dark:border-brand-700/40">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected && !allVisibleSelected; }}
                    onChange={toggleAll}
                    aria-label="Vybrat vše"
                    className="h-3.5 w-3.5 rounded border-brand-300 dark:border-brand-600 text-azure-500 focus:ring-azure-400/50 cursor-pointer"
                  />
                </th>
                {COLS.map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className="px-4 py-3 text-left text-xs font-semibold text-brand-400 dark:text-brand-400 uppercase tracking-widest cursor-pointer select-none hover:bg-brand-100/50 dark:hover:bg-brand-800/50 border-b border-brand-200/40 dark:border-brand-700/40 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      {label}
                      <SortIcon k={key} />
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-semibold text-brand-400 dark:text-brand-400 uppercase tracking-widest border-b border-brand-200/40 dark:border-brand-700/40">
                  {t.controlList.columns.documentation}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100/60 dark:divide-brand-700/40 bg-white/50 dark:bg-brand-800/40 backdrop-blur-sm">
              {filtered.map((c) => {
                const active = selectedId === c.id;
                const isChecked = selected.has(c.id);
                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedId(active ? null : c.id)}
                    className={`cursor-pointer transition-colors duration-100 ${
                      active
                        ? 'bg-azure-50/70 dark:bg-azure-900/20 border-l-2 border-l-azure-500'
                        : isChecked
                        ? 'bg-azure-50/40 dark:bg-azure-900/10'
                        : 'hover:bg-brand-50/60 dark:hover:bg-brand-700/40'
                    }`}
                  >
                    <td
                      className="px-4 py-3 w-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelect(c.id)}
                        aria-label={`Vybrat ${c.controlId}`}
                        className="h-3.5 w-3.5 rounded border-brand-300 dark:border-brand-600 text-azure-500 focus:ring-azure-400/50 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-brand-400 dark:text-brand-400 whitespace-nowrap w-28">
                      {c.controlId}
                    </td>
                    <td className="px-4 py-3 text-brand-700 dark:text-brand-100 max-w-xs truncate font-medium">
                      {c.name}
                    </td>
                    <td className="px-4 py-3 text-xs text-brand-400 dark:text-brand-400 w-36">
                      {c.category || <span className="text-brand-200 dark:text-brand-600">—</span>}
                    </td>
                    <td className="px-4 py-3 w-40">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const docs = docMap[c.id] || [];
                        if (docs.length === 0) return <span className="text-brand-200 dark:text-brand-600 text-xs">—</span>;
                        return (
                          <div className="flex items-center gap-1 flex-wrap">
                            {docs.slice(0, 2).map((doc) => (
                              <span
                                key={doc.id}
                                title={doc.name}
                                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-brand-50/80 dark:bg-brand-700/60 text-brand-600 dark:text-brand-200 rounded-md border border-brand-200/50 dark:border-brand-600/50 font-medium max-w-[140px]"
                              >
                                <FileTypeIcon fileName={doc.fileName} className="h-3 w-3 flex-shrink-0 text-brand-400 dark:text-brand-400" />
                                <span className="truncate">{doc.name}</span>
                              </span>
                            ))}
                            {docs.length > 2 && (
                              <span className="text-xs text-brand-300 dark:text-brand-500 font-medium">+{docs.length - 2}</span>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-20 text-center">
                    <p className="text-brand-300 text-sm">{t.controlList.noResults}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedControl && (
        <ControlDetail
          key={selectedControl.id}
          control={selectedControl}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
