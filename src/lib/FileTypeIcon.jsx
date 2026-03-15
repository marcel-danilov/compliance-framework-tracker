import { FileText, FileSpreadsheet, File, Image } from 'lucide-react';

export default function FileTypeIcon({ fileName, className }) {
  const ext = (fileName || '').split('.').pop().toLowerCase();
  const Icon =
    ext === 'pdf' ? FileText :
    ['xls', 'xlsx', 'csv'].includes(ext) ? FileSpreadsheet :
    ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext) ? Image :
    File;
  return <Icon className={className} aria-hidden="true" />;
}
