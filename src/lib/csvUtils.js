import Papa from 'papaparse';

export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: resolve,
      error: reject,
    });
  });
}

export function exportNormToCSV(controls, normName) {
  const rows = controls.map((c) => ({
    id: c.controlId,
    name: c.name,
    description: c.description,
    category: c.category || '',
    status: c.status,
    notes: c.notes || '',
  }));

  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${normName.replace(/[^a-z0-9]/gi, '_')}_export.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
