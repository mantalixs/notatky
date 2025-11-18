// public/sync.js

function updateOnlineIndicator() {
  const el = document.querySelector(".nav-status");
  if (!el) return;

  if (navigator.onLine) {
    el.textContent = "Online";
    el.classList.remove("offline");
  } else {
    el.textContent = "Offline";
    el.classList.add("offline");
  }
}

function updateAuthButtons() {
  const token = localStorage.getItem("token");
  const loginLink = document.getElementById("login-link");
  const logoutBtn = document.getElementById("logout-btn");

  if (!loginLink || !logoutBtn) return;

  if (token) {
    loginLink.style.display = "none";
    logoutBtn.style.display = "inline-flex";
  } else {
    loginLink.style.display = "inline-flex";
    logoutBtn.style.display = "none";
  }
}

function setupLogout() {
  const logoutBtn = document.getElementById("logout-btn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    updateAuthButtons();
    location.href = "/login.html";
  });
}

window.addEventListener("DOMContentLoaded", () => {
  updateOnlineIndicator();
  updateAuthButtons();
  setupLogout();
});

window.addEventListener("online", updateOnlineIndicator);
window.addEventListener("offline", updateOnlineIndicator);
