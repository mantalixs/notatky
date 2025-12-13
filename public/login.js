// public/login.js

document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const loginBtn = document.getElementById("login-btn");
  const registerBtn = document.getElementById("register-btn");

  if (!emailInput || !passwordInput || !loginBtn || !registerBtn) {
    console.error("login.js: не знайдені елементи форми авторизації");
    return;
  }

  // !!! ПЕРЕВІР ЦІ ШЛЯХИ ПІД СВІЙ БЕКЕНД !!!
  // Варіанти, які найчастіше бувають:
  // "/auth/login" / "/auth/register"
  // "/login" / "/register"
  const LOGIN_URL = "/auth/login";
  const REGISTER_URL = "/auth/register";

  async function sendAuth(url, email, password) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || "Помилка запиту");
    }
    return data;
  }

  loginBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      alert("Введи email і пароль");
      return;
    }

    try {
      const data = await sendAuth(LOGIN_URL, email, password);

      // очікуємо, що бек повертає token
      if (!data.token) {
        alert("Сервер не повернув токен. Перевір бекенд.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("email", email);

      location.href = "/notes.html";
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      alert(err.message || "Помилка авторизації");
    }
  });

  registerBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      alert("Введи email і пароль");
      return;
    }

    try {
      await sendAuth(REGISTER_URL, email, password);
      alert("Реєстрація успішна. Тепер можна увійти.");
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      alert(err.message || "Помилка реєстрації");
    }
  });
});
