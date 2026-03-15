export const cs = {
  // Common UI
  common: {
    cancel: 'Zrušit',
    delete: 'Smazat',
    save: 'Uložit',
    confirm: 'Potvrdit',
    export: 'Exportovat',
    import: 'Importovat',
    loading: 'Načítání…',
    noData: 'Zatím žádná data',
    saved: 'Uloženo',
    backAriaLabel: 'Zpět',
  },

  // Navigation
  nav: {
    norms: 'Normy',
    dashboard: 'Přehled',
    documents: 'Dokumentace',
    collapseAriaLabel: 'Sbalit postranní panel',
    expandAriaLabel: 'Rozbalit postranní panel',
    mainNavAriaLabel: 'Hlavní navigace',
  },

  // Norm List
  normList: {
    title: 'Compliace frameworky',
    subtitle: 'Importujte a sledujte compliance',
    importBtn: 'Importovat normu',
    empty: 'Zatím žádné normy',
    emptyHelp: 'Začněte nahráním CSV souboru s compliance frameworkem.',
    importFirst: 'Importovat první normu',
    frameworks: 'Compliance framework',
    open: 'Otevřít',
    exportBtn: 'Exportovat CSV',
    deleteNorm: 'Smazat normu',
    updated: 'Aktualizováno',
    deleteConfirmTitle: 'Smazat normu',
    deleteConfirmMessage: (name) => `Opravdu smazat "${name}"? Tím se odeberou všechna opatření.`,
  },

  // Control List
  controlList: {
    searchPlaceholder: 'Hledat ID nebo název…',
    searchAriaLabel: 'Hledat opatření',
    clearSearch: 'Vymazat hledání',
    allCategories: 'Všechny kategorie',
    categoryAriaLabel: 'Filtrovat dle kategorie',
    clearFilters: 'Vymazat',
    closePanel: 'Zavřít panel',
    noResults: 'Žádná opatření neodpovídají aktuálním filtrům.',
    documentation: 'Dokumentace',
    // Column headers
    columns: {
      id: 'ID',
      name: 'Název',
      category: 'Kategorie',
      status: 'Stav',
      documentation: 'Dokumentace',
    },
    // Status labels
    statusLabels: {
      'Not Started': 'Nezahájeno',
      'In Progress': 'Probíhá',
      Implemented: 'Implementováno',
      'Not Implemented': 'Neimplementováno',
      'N/A': 'N/A',
    },
  },

  // Control Detail Panel
  controlDetail: {
    description: 'Popis',
    status: 'Stav',
    notes: 'Poznámky',
    notesPlaceholder: 'Poznámky k implementaci, odkazy na důkazy, kontext…',
    documentation: 'Dokumentace',
    addDocument: 'Přidat',
    editDocuments: '+ Upravit výběr',
    assignDocument: 'Přiřadit dokument z registru',
    downloadAriaLabel: 'Stáhnout',
    unlinkAriaLabel: 'Odebrat vazbu',
    saveBtn: 'Uložit',
    updated: (date) => `Aktualizováno ${date}`,
    statusConfig: {
      'Not Started': { label: 'Nezahájeno' },
      'In Progress': { label: 'Probíhá' },
      Implemented: { label: 'Implementováno' },
      'Not Implemented': { label: 'Neimplementováno' },
      'N/A': { label: 'N/A' },
    },
  },

  // Document Register
  documentRegister: {
    title: 'Dokumentace',
    subtitle: 'Registr podpůrné dokumentace',
    uploadBtn: 'Nahrát dokument',
    searchPlaceholder: 'Hledat dokumenty…',
    empty: 'Zatím žádné dokumenty.',
    emptySearch: 'Žádné dokumenty neodpovídají hledání.',
    uploadFirst: 'Nahrát první dokument',
    // Table columns
    columns: {
      name: 'Název',
      file: 'Soubor',
      added: 'Přidáno',
      usage: 'Použití',
    },
    usage: {
      unused: 'Nepoužito',
      singular: '1 opatření',
      few: (count) => `${count} opatření`,
      many: (count) => `${count} opatření`,
    },
    downloadAriaLabel: 'Stáhnout',
    deleteAriaLabel: 'Smazat',
    deleteConfirmTitle: 'Smazat dokument',
    deleteConfirmMessage: (name) => `Opravdu smazat „${name}"? Tím se odstraní i všechny vazby na opatření.`,
  },

  // Upload Modal
  uploadModal: {
    title: 'Nahrát dokument',
    subtitle: 'Přidejte dokument do registru',
    nameLabel: 'Název',
    nameRequired: '*',
    descriptionLabel: 'Popis',
    descriptionOptional: '(nepovinné)',
    fileLabel: 'Soubor',
    fileRequired: '*',
    dropZoneText: 'Klikněte nebo přetáhněte soubor sem',
    dropZoneHint: 'Jakýkoli formát souboru',
    uploadBtn: 'Nahrát',
    uploadingBtn: 'Nahrávám…',
  },

  // Document Picker Modal
  documentPicker: {
    title: 'Dokumentace opatření',
    subtitle: 'Vyberte dokumenty z registru',
    empty: 'Registr dokumentů je prázdný. Nejprve nahrajte dokumenty v sekci Dokumentace.',
  },

  // Import Modal
  importModal: {
    title: 'Importovat compliance framework',
    step1: 'Importovat compliance framework',
    step2: 'Náhled importu',
    step3: 'Import dokončen',
    nameLabel: 'Název normy',
    descriptionLabel: 'Popis',
    descriptionOptional: '(nepovinné)',
    fileLabel: 'CSV soubor',
    dropZoneText: 'Klikněte pro výběr CSV souboru',
    dropZoneHint: 'Povinné sloupce: id, name, description',
    conflictTitle: 'Konflikt',
    conflictMessage: (name) => `Norma s názvem „${name}" již existuje.`,
    overwrite: 'Přepsat existující normu',
    preview: (total, count, name) => `Náhled prvních ${count} z ${total} řádků — bude importováno do „${name}"`,
    skippedRows: 'Přeskočené řádky',
    rowError: (index) => `Řádek ${index}`,
    missingFields: 'Chybí:',
    resultTitle: 'Import dokončen',
    resultMessage: (count) => {
      if (count === 1) return 'Bylo importováno 1 opatření';
      if (count >= 2 && count <= 4) return `Byla importována ${count} opatření`;
      return `Bylo importováno ${count} opatření`;
    },
    prevBtn: 'Zpět',
    previewBtn: 'Náhled importu',
    importBtn: (count) => {
      if (count === 1) return 'Importovat 1 opatření';
      if (count >= 2 && count <= 4) return `Importovat ${count} opatření`;
      return `Importovat ${count} opatření`;
    },
    doneBtn: 'Hotovo',
    cancelBtn: 'Zrušit',
  },

  // Dashboard
  dashboard: {
    title: 'Přehled',
    subtitle: 'Přehled compliance',
    // KPIs
    totalControls: 'Celkem opatření',
    implemented: 'Implementováno',
    implementedOf: (done, total) => `${done} z ${total} opatření`,
    // Progress sections
    progress: 'Postup dle frameworku',
    progressOf: (done, total) => `${done}/${total} implementováno`,
    empty: 'Zatím žádná data',
    goToNorms: 'Přejít na normy',
  },

  // Status Badge (general)
  statusBadge: {
    'Not Started': { label: 'Nezahájeno' },
    'In Progress': { label: 'Probíhá' },
    Implemented: { label: 'Implementováno' },
    'Not Implemented': { label: 'Neimplementováno' },
    'N/A': { label: 'N/A' },
  },

  // Stacked Bar (progress bar segments)
  stackedBar: {
    segments: {
      implemented: 'Implementováno',
      inProgress: 'Probíhá',
      na: 'N/A',
      notImplemented: 'Neimplementováno',
      notStarted: 'Nezahájeno',
    },
    ariaLabel: (segments) => {
      // segments is like: { implemented: 1, inProgress: 0, na: 1, ... }
      const parts = [];
      if (segments.implemented > 0) parts.push(`${segments.implemented} Implementováno`);
      if (segments.inProgress > 0) parts.push(`${segments.inProgress} Probíhá`);
      if (segments.na > 0) parts.push(`${segments.na} N/A`);
      if (segments.notImplemented > 0) parts.push(`${segments.notImplemented} Neimplementováno`);
      if (segments.notStarted > 0) parts.push(`${segments.notStarted} Nezahájeno`);
      return `Rozdělení stavů: ${parts.join(', ')}`;
    },
  },

  // Confirm Dialog
  confirmDialog: {
    cancelBtn: 'Zrušit',
  },

  // Bulk Edit
  bulkEdit: {
    selected: (n) => `${n} vybráno`,
    changeStatus: 'Změnit stav',
    clearSelection: 'Zrušit výběr',
  },

  // Document Versioning
  docVersions: {
    uploadNew: 'Nahrát novou verzi',
    history: 'Historie verzí',
    version: (n) => `v${n}`,
    current: 'Aktuální',
    comment: 'Poznámka ke změně',
    commentPlaceholder: 'Co se změnilo v této verzi? (nepovinné)',
    uploadBtn: 'Nahrát verzi',
    uploadingBtn: 'Nahrávám…',
    downloadVersion: (n) => `Stáhnout v${n}`,
    noVersions: 'Žádné verze',
    uploadedAt: 'Nahráno',
    closeHistory: 'Zavřít',
  },
};
