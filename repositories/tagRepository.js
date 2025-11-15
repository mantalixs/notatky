const Tag = require("../models/Tag");

module.exports = {
  async findOrCreateByName(userId, name) {
    let tag = await Tag.findOne({ userId, name });
    if (!tag) {
      tag = new Tag({ userId, name });
      await tag.save();
    }
    return tag;
  },

  getByUser(userId) {
    return Tag.find({ userId });
  },
};
