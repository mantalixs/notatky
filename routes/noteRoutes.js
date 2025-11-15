const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const Note = require("../models/Note");

router.use(auth);

router.post("/", async (req, res) => {
  try {
    let { title, text, tags } = req.body;

    if (!title || !text) {
      return res.status(400).json({ message: "Заповніть заголовок і текст" });
    }

    console.log("RAW TAGS:", tags);

    // 🛠 Коректна обробка тегів
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

    console.log("FINAL TAGS:", tags);

    const note = await Note.create({
      title,
      text,
      tags,
      user: req.userId,
    });

    console.log("NOTE CREATED:", note);
    res.json(note);
  } catch (err) {
    console.error("CREATE NOTE ERROR:", err);
    res.status(500).json({ message: "Помилка створення нотатки" });
  }
});

router.get("/", async (req, res) => {
  try {
    console.log("GET NOTES for user:", req.userId);

    const notes = await Note.find({ user: req.userId }).sort({ createdAt: -1 });

    console.log("FOUND NOTES:", notes);
    res.json(notes);
  } catch (err) {
    console.error("GET NOTES ERROR:", err);
    res.status(500).json({ message: "Не вдалося отримати нотатки" });
  }
});

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

router.patch("/:id", async (req, res) => {
  try {
    const { title, text, tags } = req.body;

    const note = await Note.findOne({ _id: req.params.id, user: req.userId });

    if (!note) return res.status(404).json({ message: "Нотатку не знайдено" });

    note.title = title ?? note.title;
    note.text = text ?? note.text;

    if (tags) {
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

router.patch("/:id/toggle", async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.userId });

    if (!note) {
      return res.status(404).json({ message: "Нотатку не знайдено" });
    }

    note.done = !note.done;
    await note.save();

    res.json(note);
  } catch (err) {
    console.error("TOGGLE ERROR:", err);
    res.status(500).json({ message: "Помилка оновлення нотатки" });
  }
});

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

router.get("/stats/info", async (req, res) => {
  try {
    const done = await Note.countDocuments({ user: req.userId, done: true });
    const pending = await Note.countDocuments({
      user: req.userId,
      done: false,
    });

    res.json({ done, pending });
  } catch (err) {
    console.error("STATS ERROR:", err);
    res.status(500).json({ message: "Не вдалося отримати статистику" });
  }
});

module.exports = router;
