export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("notes-db", 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("notes")) {
        db.createObjectStore("notes", { keyPath: "id" });
      }
    };

    request.onerror = reject;
    request.onsuccess = () => resolve(request.result);
  });
}

export async function saveOffline(note) {
  const db = await openDB();
  const tx = db.transaction("notes", "readwrite");
  tx.objectStore("notes").put({
    ...note,
    status: "pending",
    temp: true,
    id: crypto.randomUUID(),
  });
  return tx.complete;
}

export async function getPendingNotes() {
  const db = await openDB();
  const tx = db.transaction("notes", "readonly");
  const store = tx.objectStore("notes");

  return new Promise((resolve) => {
    const req = store.getAll();
    req.onsuccess = () =>
      resolve(req.result.filter((n) => n.status === "pending"));
  });
}

export async function markAsSynced(serverNotes) {
  const db = await openDB();
  const tx = db.transaction("notes", "readwrite");
  const store = tx.objectStore("notes");

  for (const n of serverNotes) {
    store.put({
      ...n,
      temp: false,
      status: "synced",
    });
  }
  return tx.complete;
}
