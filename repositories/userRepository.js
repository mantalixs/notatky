const User = require("../models/User");

module.exports = {
  findByEmail(email) {
    return User.findOne({ email });
  },

  create(data) {
    const user = new User(data);
    return user.save();
  },

  findById(id) {
    return User.findById(id);
  },
};
