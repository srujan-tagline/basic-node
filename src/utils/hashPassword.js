const bcrypt = require("bcryptjs");

const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

module.exports = { hashPassword };
