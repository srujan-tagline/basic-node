const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authenticateUser = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Unauthorized access." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

const authorizeTeacher = (req, res, next) => {
  if (req.user.role !== "teacher") {
    return res.status(403).json({ error: "Access denied. Teachers only." });
  }
  next();
};

const authorizeStudent = (req, res, next) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ error: "Access denied. Student only." });
  }
  next();
};

module.exports = { authenticateUser, authorizeTeacher, authorizeStudent };
