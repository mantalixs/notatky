const CACHE_NAME = "notatky-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/sync.js",
  "/idb.js",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// === IndexedDB для офлайн нотаток (як було) ===

function openDB() {
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

async function getPendingNotes() {
  const db = await openDB();
  const tx = db.transaction("notes", "readonly");
  const store = tx.objectStore("notes");

  return new Promise((resolve) => {
    const req = store.getAll();
    req.onsuccess = () =>
      resolve(req.result.filter((n) => n.status === "pending"));
  });
}

async function markAsSynced(serverNotes) {
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

// === Service Worker події ===

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  clients.claim();
});

// Offline-first для навігації + статики
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Для API (/notes, /auth/...) не кешуємо — нехай ідуть напряму
  const url = new URL(request.url);
  if (url.pathname.startsWith("/notes") || url.pathname.startsWith("/auth")) {
    return;
  }

  if (request.method === "GET") {
    event.respondWith(
      caches
        .match(request)
        .then(
          (cached) =>
            cached ||
            fetch(request).catch(() =>
              url.pathname === "/"
                ? caches.match("/index.html")
                : Promise.reject(),
            ),
        ),
    );
  }
});

// Background sync
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-notes") {
    event.waitUntil(syncNotes());
  }
});

async function syncNotes() {
  const pending = await getPendingNotes();
  if (!pending.length) return;

  // ⚠ Тут важливо: токен беремо з кожного pending? або з IndexedDB?
  // Спрощено: надсилаємо без токена, якщо твій /notes/sync працює без auth.
  const res = await fetch("/notes/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pending),
  });

  if (!res.ok) {
    console.error("Sync failed");
    return;
  }

  const serverNotes = await res.json();
  await markAsSynced(serverNotes);
}
