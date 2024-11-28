const jwt = require("jsonwebtoken");

const generateToken = (payload, expiresIn, purpose) => {
  return jwt.sign({ ...payload, purpose }, process.env.JWT_SECRET, { expiresIn });
};

module.exports = { generateToken };