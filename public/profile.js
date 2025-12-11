if (!localStorage.getItem("token")) {
  alert("Спочатку увійдіть!");
  location.href = "/login.html";
}

document.getElementById("email").innerText = localStorage.getItem("email");

async function loadStats() {
  const token = localStorage.getItem("token");

  const res = await fetch("/notes/stats", {
    headers: { Authorization: "Bearer " + token },
  });

  const data = await res.json();

  const ctx = document.getElementById("chart");

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Виконані", "Невиконані"],
      datasets: [
        {
          data: [data.done, data.pending],
          backgroundColor: ["#4caf50", "#e91e63"],
        },
      ],
    },
  });
}

loadStats();

function logout() {
  localStorage.clear();
  location.href = "/";
}

window.logout = logout;
