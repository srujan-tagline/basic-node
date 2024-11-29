const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authenticateUser = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Unauthorized access." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.purpose !== "login") {
      return res.status(403).json({ message: "Invalid token for this action" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token." });
  }
};

const authorizeRole = (roles) => {
  return async (req, res, next) => {
    if (roles.indexOf(req.user.role) > -1) {
      next();
    } else {
      return res
        .status(403)
        .json({ error: `User's role ${req.user.role} is not authorized.` });
    }
  };
};

module.exports = { authenticateUser, authorizeRole };
// exports.authenticateUser = authenticateUser; `