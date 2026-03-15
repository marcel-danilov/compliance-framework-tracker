import { useTranslation } from '../lib/useTranslation';

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  danger = false,
}) {
  const t = useTranslation();
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0,31,42,0.50)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="bg-white dark:bg-brand-800 rounded-2xl w-full max-w-md p-6 border border-brand-100 dark:border-brand-700"
        style={{ boxShadow: '0 20px 60px 0 rgba(0,31,42,0.22)' }}
      >
        <h3 className="font-semibold text-brand-500 dark:text-white mb-1.5 tracking-tight">{title}</h3>
        <p className="text-sm text-gray-400 dark:text-brand-400 mb-6 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-2.5">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-400 dark:text-brand-400 hover:text-brand-500 dark:hover:text-white font-medium transition-colors"
          >
            {t.confirmDialog.cancelBtn}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-xl text-white active:scale-95 transition-all ${
              danger ? 'bg-red-500 hover:bg-red-600' : 'bg-azure-500 hover:bg-azure-600'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
