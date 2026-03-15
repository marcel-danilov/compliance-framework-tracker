import Dexie from 'dexie';

export const db = new Dexie('ComplianceManager');

db.version(1).stores({
  norms: '++id, name, createdAt, updatedAt',
  controls: '++id, normId, controlId, status, owner, dueDate, updatedAt',
});

db.version(2).stores({
  norms: '++id, name, createdAt, updatedAt',
  controls: '++id, normId, controlId, status, owner, dueDate, updatedAt',
  documents: '++id, name, fileName, fileType, uploadedAt',
  controlDocuments: '++id, controlId, documentId',
});

db.version(3).stores({
  norms: '++id, name, createdAt, updatedAt',
  controls: '++id, normId, controlId, status, owner, dueDate, updatedAt',
  documents: '++id, name, fileName, fileType, uploadedAt',
  controlDocuments: '++id, controlId, documentId',
  documentVersions: '++id, documentId, versionNumber, uploadedAt',
}).upgrade(async (trans) => {
  const docs = await trans.table('documents').toArray();
  for (const doc of docs) {
    await trans.table('documentVersions').add({
      documentId: doc.id,
      versionNumber: 1,
      fileName: doc.fileName,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      fileData: doc.fileData,
      uploadedAt: doc.uploadedAt,
      comment: '',
    });
    await trans.table('documents').update(doc.id, { currentVersion: 1 });
  }
});
