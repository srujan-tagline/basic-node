const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { statusCode, responseMessage } = require("../utils/constant");
const { response } = require("../utils/common");

const authenticateUser = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return response(
      false,
      res,
      statusCode.UNAUTHORIZED,
      responseMessage.UNAUTHENTICATED
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.purpose !== "login") {
      return response(
        false,
        res,
        statusCode.FORBIDDEN,
        responseMessage.INVALID_TOKEN_FOR_ACTION
      );
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return response(
        false,
        res,
        statusCode.NOT_FOUND,
        responseMessage.USER_NOT_FOUND
      );
    }

    req.user = user;
    next();
  } catch (err) {
    return response(
      false,
      res,
      statusCode.UNAUTHORIZED,
      responseMessage.INVALID_TOKEN
    );
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
// exports.authenticateUser = authenticateUser;
