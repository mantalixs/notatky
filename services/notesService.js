const noteRepository = require("../repositories/noteRepository");
const tagRepository = require("../repositories/tagRepository");

module.exports = {
  async createNote(userId, { title, content, tags = [] }) {
    const tagDocs = [];
    for (const name of tags) {
      const tag = await tagRepository.findOrCreateByName(userId, name);
      tagDocs.push(tag);
    }

    const note = await noteRepository.create({
      userId,
      title,
      content,
      tags: tagDocs.map((t) => t.id),
    });

    return note.populate("tags");
  },

  getNotes(userId, filters) {
    return noteRepository.findByUser(userId, filters);
  },

  async updateNote(userId, noteId, data) {
    const note = await noteRepository.findById(noteId);
    if (!note || String(note.userId) !== String(userId)) {
      throw new Error("Not found or no access");
    }

    const updateData = { ...data };

    if (data.tags) {
      const tagDocs = [];
      for (const name of data.tags) {
        const tag = await tagRepository.findOrCreateByName(userId, name);
        tagDocs.push(tag);
      }
      updateData.tags = tagDocs.map((t) => t.id);
    }

    return noteRepository.update(noteId, updateData);
  },

  async deleteNote(userId, noteId) {
    const note = await noteRepository.findById(noteId);
    if (!note || String(note.userId) !== String(userId)) {
      throw new Error("Not found or no access");
    }
    await noteRepository.softDelete(noteId);
  },
};
