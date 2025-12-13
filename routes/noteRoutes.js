const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const Note = require("../models/Note");

// усі роуты захищені авторизацією
router.use(auth);

// -------------------- СТВОРИТИ НОТАТКУ --------------------
router.post("/", async (req, res) => {
  try {
    let { title, text, tags } = req.body;

    if (!title || !text) {
      return res.status(400).json({ message: "Заповніть заголовок і текст" });
    }

    // нормалізація тегів
    if (!tags) {
      tags = [];
    } else if (typeof tags === "string") {
      tags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    } else if (Array.isArray(tags)) {
      tags = tags.map((t) => String(t).trim());
    } else {
      tags = [String(tags).trim()];
    }

    const note = await Note.create({
      title,
      text,
      tags,
      user: req.userId, // 👈 правильний користувач
      done: false, // нові нотатки завжди "в процесі"
    });

    res.json(note);
  } catch (err) {
    console.error("CREATE NOTE ERROR:", err);
    res.status(500).json({ message: "Помилка створення нотатки" });
  }
});

// -------------------- ОТРИМАТИ ВСІ НОТАТКИ --------------------
router.get("/", async (req, res) => {
  try {
    const notes = await Note.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error("GET NOTES ERROR:", err);
    res.status(500).json({ message: "Не вдалося отримати нотатки" });
  }
});

// -------------------- СТАТИСТИКА --------------------
router.get("/stats/info", async (req, res) => {
  try {
    const done = await Note.countDocuments({ user: req.userId, done: true });

    // pending: або done === false, або поле done взагалі відсутнє (старі записи)
    const pending = await Note.countDocuments({
      user: req.userId,
      $or: [{ done: false }, { done: { $exists: false } }],
    });

    res.json({ done, pending });
  } catch (err) {
    console.error("STATS ERROR:", err);
    res.status(500).json({ message: "Не вдалося отримати статистику" });
  }
});

// -------------------- ОТРИМАТИ ОДНУ НОТАТКУ --------------------
router.get("/:id", async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.userId });

    if (!note) return res.status(404).json({ message: "Нотатку не знайдено" });

    res.json(note);
  } catch (err) {
    console.error("GET NOTE ERROR:", err);
    res.status(500).json({ message: "Не вдалося отримати нотатку" });
  }
});

// -------------------- ОНОВИТИ НОТАТКУ (текст/заголовок/теги) --------------------
router.patch("/:id", async (req, res) => {
  try {
    const { title, text, tags } = req.body;

    const note = await Note.findOne({ _id: req.params.id, user: req.userId });

    if (!note) return res.status(404).json({ message: "Нотатку не знайдено" });

    if (title !== undefined) note.title = title;
    if (text !== undefined) note.text = text;

    if (tags !== undefined) {
      if (typeof tags === "string") {
        note.tags = tags.split(",").map((t) => t.trim());
      } else if (Array.isArray(tags)) {
        note.tags = tags.map((t) => t.trim());
      }
    }

    await note.save();
    res.json(note);
  } catch (err) {
    console.error("UPDATE NOTE ERROR:", err);
    res.status(500).json({ message: "Помилка оновлення нотатки" });
  }
});

// -------------------- ПЕРЕКЛЮЧИТИ СТАТУС (toggle) --------------------
router.patch("/:id/toggle", async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.userId });

    if (!note) {
      return res.status(404).json({ message: "Нотатку не знайдено" });
    }

    // якщо поле done було відсутнє, вважаємо його false
    note.done = !note.done;
    await note.save();

    res.json(note);
  } catch (err) {
    console.error("TOGGLE ERROR:", err);
    res.status(500).json({ message: "Помилка оновлення нотатки" });
  }
});

// -------------------- ВИДАЛИТИ НОТАТКУ --------------------
router.delete("/:id", async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!note) {
      return res.status(404).json({ message: "Нотатку не знайдено" });
    }

    res.json({ message: "Видалено" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: "Помилка видалення" });
  }
});

module.exports = router;
