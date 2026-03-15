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
      style={{ backgroundColor: 'rgba(30,22,16,0.45)', backdropFilter: 'blur(6px)' }}
    >
      <div className="glass-modal rounded-2xl w-full max-w-md p-6 shadow-modal">
        <h3 className="font-semibold text-brand-800 dark:text-brand-100 mb-1.5 tracking-tight">{title}</h3>
        <p className="text-sm text-brand-400 dark:text-brand-400 mb-6 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-2.5">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-brand-400 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-100 font-medium transition-colors"
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
