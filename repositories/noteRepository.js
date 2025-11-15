const Note = require("../models/Note");

module.exports = {
  create(data) {
    const note = new Note(data);
    return note.save();
  },

  findById(id) {
    return Note.findById(id).populate("tags");
  },

  findByUser(userId, filters = {}) {
    const query = { userId, deletedAt: null };

    if (filters.tagId) query.tags = filters.tagId;
    if (filters.search) {
      query.$or = [
        { title: new RegExp(filters.search, "i") },
        { content: new RegExp(filters.search, "i") },
      ];
    }

    let mongoQuery = Note.find(query).populate("tags");

    if (filters.sort === "createdAt_desc") {
      mongoQuery = mongoQuery.sort({ createdAt: -1 });
    }

    return mongoQuery;
  },

  update(id, data) {
    return Note.findByIdAndUpdate(id, data, { new: true }).populate("tags");
  },

  softDelete(id) {
    return Note.findByIdAndUpdate(id, { deletedAt: new Date() });
  },
};
