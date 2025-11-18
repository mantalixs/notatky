const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    text: { type: String, required: true },
    tags: [{ type: String }], // масив тегів
    done: { type: Boolean, default: false }, // 👈 СТАН НОТАТКИ (за замовчуванням "в процесі")
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }, // createdAt / updatedAt
);

module.exports = mongoose.model("Note", NoteSchema);
