const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (payload, expiresIn, purpose) => {
  return jwt.sign({ ...payload, purpose }, process.env.JWT_SECRET, {
    expiresIn,
  });
};

const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

const response = (flag, res, statusCode, message, data) => {
  if (flag) {
    return res.status(statusCode).json({ message, data });
  }
  return res.status(statusCode).json({ message });
};

module.exports = {generateToken, hashPassword, response};