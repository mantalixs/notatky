async function loadNotes() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Спочатку увійдіть!");
    return (window.location.href = "/login.html");
  }

  const res = await fetch("/notes", {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const data = await res.json();

  const container = document.getElementById("notes-list");
  container.innerHTML = "";

  if (!data.length) {
    container.innerHTML = "<p>Поки що немає нотаток.</p>";
    return;
  }

  data.forEach((n) => {
    const div = document.createElement("div");
    div.className = "note-card";
    div.innerHTML = `
            <h3>${n.title}</h3>
            <p>${n.text}</p>
            <small>Теги: ${n.tags.join(", ")}</small><br>
            <small>Створено: ${new Date(n.createdAt).toLocaleString()}</small>
        `;
    container.appendChild(div);
  });
}

loadNotes();
