const jwt = require("jsonwebtoken");

const generateToken = (payload, expiresIn, purpose) => {
  const data = { ...payload, purpose };
  return jwt.sign(data, process.env.JWT_SECRET, { expiresIn });
};

module.exports = { generateToken };