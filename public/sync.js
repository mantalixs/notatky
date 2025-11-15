import { saveOffline } from "./idb.js";

const API_BASE = "";

// === AUTH ===

function getToken() {
  return localStorage.getItem("token");
}

function setToken(token) {
  if (token) localStorage.setItem("token", token);
}

function clearToken() {
  localStorage.removeItem("token");
}

function updateAuthUI() {
  const token = getToken();
  const status = document.getElementById("auth-status");
  const logoutBtn = document.getElementById("logout-btn");

  if (token) {
    status.textContent = "Ви увійшли в систему";
    status.classList.remove("auth-status--anon");
    status.classList.add("auth-status--user");
    logoutBtn.classList.remove("hidden");
  } else {
    status.textContent = "Ви не увійшли";
    status.classList.add("auth-status--anon");
    status.classList.remove("auth-status--user");
    logoutBtn.classList.add("hidden");
  }
}

async function register() {
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;

  if (!email || !password) {
    alert("Заповніть email і пароль");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Помилка реєстрації");
    }

    alert("Реєстрація успішна, тепер увійдіть.");
  } catch (e) {
    console.error(e);
    alert(e.message);
  }
}

async function login() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    alert("Заповніть email і пароль");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Помилка входу");
    }

    setToken(data.token);
    updateAuthUI();
    await loadNotes();
  } catch (e) {
    console.error(e);
    alert(e.message);
  }
}

// === NOTES ===

async function createNoteOnline(data) {
  const token = getToken();
  if (!token) {
    throw new Error("Спочатку увійдіть у систему");
  }

  const res = await fetch(`${API_BASE}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Не вдалося створити нотатку");
  }

  return res.json();
}

async function createNoteHandler() {
  const title = document.getElementById("note-title").value.trim();
  const content = document.getElementById("note-content").value.trim();
  const tagsRaw = document.getElementById("note-tags").value.trim();
  const message = document.getElementById("note-message");

  if (!title && !content) {
    message.textContent = "Введіть хоча б заголовок або текст.";
    message.className = "message message--error";
    return;
  }

  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const noteData = {
    title,
    content,
    tags,
  };

  try {
    if (!navigator.onLine) {
      console.log("Немає інтернету — зберігаю в IndexedDB...");
      await saveOffline(noteData);

      const sw = await navigator.serviceWorker.ready;
      await sw.sync.register("sync-notes");

      message.textContent =
        "Нотатку збережено офлайн. Вона синхронізується при появі інтернету.";
      message.className = "message message--ok";
    } else {
      await createNoteOnline(noteData);
      message.textContent = "Нотатку збережено на сервері.";
      message.className = "message message--ok";
      await loadNotes();
    }

    document.getElementById("note-title").value = "";
    document.getElementById("note-content").value = "";
    document.getElementById("note-tags").value = "";
  } catch (e) {
    console.error(e);
    message.textContent = e.message;
    message.className = "message message--error";
  }
}

async function loadNotes() {
  const token = getToken();
  const list = document.getElementById("notes-list");

  if (!token) {
    list.innerHTML =
      '<p class="hint">Щоб побачити нотатки, увійдіть у систему.</p>';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/notes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Не вдалося завантажити нотатки");
    }

    const notes = await res.json();

    if (!notes.length) {
      list.innerHTML =
        '<p class="hint">У вас ще немає нотаток. Створіть першу!</p>';
      return;
    }

    list.innerHTML = "";
    notes.forEach((n) => {
      const div = document.createElement("div");
      div.className = "note-item";

      const title = document.createElement("h3");
      title.textContent = n.title || "(без заголовка)";

      const content = document.createElement("p");
      content.textContent = n.content || "";

      const meta = document.createElement("div");
      meta.className = "note-meta";

      const date = n.createdAt
        ? new Date(n.createdAt).toLocaleString("uk-UA")
        : "";

      meta.innerHTML = `
                <span>${date}</span>
                ${
                  n.tags && n.tags.length
                    ? ` · <span class="note-tags">теги: ${n.tags.join(", ")}</span>`
                    : ""
                }
            `;

      div.appendChild(title);
      if (n.content) div.appendChild(content);
      div.appendChild(meta);

      list.appendChild(div);
    });
  } catch (e) {
    console.error(e);
    list.innerHTML = `<p class="message message--error">${e.message}</p>`;
  }
}

// === UI wiring ===

function setupTabs() {
  const tabButtons = document.querySelectorAll(".tab-button");
  const loginTab = document.getElementById("tab-login");
  const regTab = document.getElementById("tab-register");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("tab-button--active"));
      btn.classList.add("tab-button--active");

      if (btn.dataset.tab === "login") {
        loginTab.classList.add("tab-content--active");
        regTab.classList.remove("tab-content--active");
      } else {
        regTab.classList.add("tab-content--active");
        loginTab.classList.remove("tab-content--active");
      }
    });
  });
}

function setupOnlineIndicator() {
  const indicator = document.getElementById("online-indicator");

  function update() {
    if (navigator.onLine) {
      indicator.textContent = "Online";
      indicator.classList.remove("status--offline");
      indicator.classList.add("status--online");
    } else {
      indicator.textContent = "Offline";
      indicator.classList.add("status--offline");
    }
  }

  window.addEventListener("online", update);
  window.addEventListener("offline", update);
  update();
}

function setupHandlers() {
  document.getElementById("register-btn").addEventListener("click", register);
  document.getElementById("login-btn").addEventListener("click", login);
  document.getElementById("logout-btn").addEventListener("click", () => {
    clearToken();
    updateAuthUI();
    loadNotes();
  });

  document
    .getElementById("create-note-btn")
    .addEventListener("click", createNoteHandler);

  document
    .getElementById("reload-notes-btn")
    .addEventListener("click", loadNotes);

  setupTabs();
  setupOnlineIndicator();
  updateAuthUI();
}

// === Init ===

window.addEventListener("DOMContentLoaded", () => {
  setupHandlers();
  if (getToken()) {
    loadNotes();
  }
});
