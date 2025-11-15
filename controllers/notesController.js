const Note = require("../models/Note");

exports.createNote = async (req, res) => {
  try {
    console.log("USER ID (create):", req.userId);

    const note = await Note.create({
      title: req.body.title,
      text: req.body.text,
      tags: req.body.tags || [],
      user: req.userId,
    });

    console.log("NOTE CREATED:", note);

    res.json({ message: "Нотатку створено!" });
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ message: "Помилка створення нотатки" });
  }
};

exports.getNotes = async (req, res) => {
  try {
    console.log("GET NOTES for USER:", req.userId);

    const notes = await Note.find({ user: req.userId });
    console.log("FOUND NOTES:", notes);

    res.json(notes);
  } catch (err) {
    console.error("GET NOTES ERROR:", err);
    res.status(500).json({ message: "Помилка завантаження нотаток" });
  }
};
