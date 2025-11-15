const API_BASE = "";
const TOKEN_KEY = "notatky_token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function isLoggedIn() {
  return !!getToken();
}

function setupOnlineIndicator() {
  const el = document.querySelector(".nav-status");
  if (!el) return;

  function update() {
    if (navigator.onLine) {
      el.textContent = "Online";
      el.classList.remove("offline");
    } else {
      el.textContent = "Offline";
      el.classList.add("offline");
    }
  }

  window.addEventListener("online", update);
  window.addEventListener("offline", update);
  update();
}

function markActiveNav() {
  const path = window.location.pathname;
  const links = document.querySelectorAll(".nav-link");
  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === path) {
      link.classList.add("nav-link-active");
    }
  });
}

async function handleRegister(e) {
  e.preventDefault();
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

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || "Помилка реєстрації");
    }

    alert("Реєстрація успішна! Тепер увійдіть.");
  } catch (err) {
    alert(err.message);
  }
}

async function handleLogin(e) {
  e.preventDefault();
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
    window.location.href = "/notes.html";
  } catch (err) {
    alert(err.message);
  }
}

function initLoginPage() {
  const loginForm = document.getElementById("login-form");
  const regForm = document.getElementById("register-form");

  if (loginForm) loginForm.addEventListener("submit", handleLogin);
  if (regForm) regForm.addEventListener("submit", handleRegister);
}

async function createNote(e) {
  e.preventDefault();
  const title = document.getElementById("note-title").value.trim();
  const text = document.getElementById("note-text").value.trim();
  const tagsRaw = document.getElementById("note-tags").value.trim();
  const msg = document.getElementById("note-message");

  if (!title || !text) {
    msg.textContent = "Введіть заголовок і текст.";
    msg.className = "message message-error";
    return;
  }

  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const token = getToken();
  if (!token) {
    msg.textContent = "Спочатку увійдіть у систему.";
    msg.className = "message message-error";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, text, tags }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Не вдалося створити нотатку");
    }

    msg.textContent = "Нотатку створено!";
    msg.className = "message message-ok";

    document.getElementById("note-title").value = "";
    document.getElementById("note-text").value = "";
    document.getElementById("note-tags").value = "";
  } catch (err) {
    msg.textContent = err.message;
    msg.className = "message message-error";
  }
}

function initCreatePage() {
  const form = document.getElementById("create-form");
  if (form) form.addEventListener("submit", createNote);
}

async function loadNotes() {
  const list = document.getElementById("notes-list");
  const token = getToken();

  if (!token) {
    list.innerHTML = '<p class="text-muted">Спочатку увійдіть у систему.</p>';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/notes`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Не вдалося завантажити нотатки");
    }

    if (!data.length) {
      list.innerHTML = '<p class="text-muted">У вас ще немає нотаток.</p>';
      return;
    }

    list.innerHTML = "";
    data.forEach((n) => {
      const div = document.createElement("div");
      div.className = "note-item";

      const title = document.createElement("h3");
      title.className = "note-title";
      title.textContent = n.title;

      const text = document.createElement("p");
      text.className = "note-text";
      text.textContent = n.text;

      const meta = document.createElement("div");
      meta.className = "note-meta";

      const date = n.createdAt
        ? new Date(n.createdAt).toLocaleString("uk-UA")
        : "";

      meta.innerHTML = `${date}${
        n.tags && n.tags.length
          ? ` · <span class="note-tags">теги: ${n.tags.join(", ")}</span>`
          : ""
      }`;

      div.appendChild(title);
      div.appendChild(text);
      div.appendChild(meta);
      list.appendChild(div);
    });
  } catch (err) {
    list.innerHTML = `<p class="message message-error">${err.message}</p>`;
  }
}

function initNotesPage() {
  loadNotes();
}

function initProfilePage() {
  const status = document.getElementById("profile-status");
  if (!status) return;

  if (isLoggedIn()) {
    status.textContent = "Ви увійшли в систему.";
  } else {
    status.textContent = "Ви не авторизовані.";
  }
}

function setupLogoutButton() {
  const btn = document.getElementById("logout-btn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    clearToken();
    window.location.href = "/login.html";
  });
}

function registerSW() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("SW registration failed", err);
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  setupOnlineIndicator();
  markActiveNav();
  setupLogoutButton();
  registerSW();

  const page = document.body.dataset.page;
  if (page === "login") initLoginPage();
  if (page === "create") initCreatePage();
  if (page === "notes") initNotesPage();
  if (page === "profile") initProfilePage();
});
