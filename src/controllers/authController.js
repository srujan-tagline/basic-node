const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const { generateToken } = require("../utils/common");
const { hashPassword } = require("../utils/common");
const {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserById,
} = require("../services/userService");
const { statusCode, responseMessage } = require("../utils/constant");
const { response } = require("../utils/common");
const cloudinary = require("../../config/cloudinary");
require("dotenv").config();

const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return response(
        false,
        res,
        statusCode.BAD_REQUEST,
        responseMessage.EMAIL_ALREADY_USE
      );
    }

    const hashedPassword = await hashPassword(password);

    await createUser({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const token = generateToken({ email }, "1h", "verifyEmail");
    // Send verification email
    const verificationLink = `${process.env.BASE_URL}/auth/verify-email?token=${token}`;

    try {
      await sendEmail(
        email,
        "Verify Your Email",
        `Click here to verify: ${verificationLink}`
      );
    } catch (err) {
      return response(
        false,
        res,
        statusCode.CREATED,
        responseMessage.SIGNUP_SUCCESSFUL_BUT_VERIFYMAIL_NOT_SENT
      );
    }

    return response(
      true,
      res,
      statusCode.CREATED,
      responseMessage.SIGNUP_SUCCESSFUL
    );
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    let decode;
    try {
      decode = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return response(
          false,
          res,
          statusCode.BAD_REQUEST,
          responseMessage.TOKEN_EXPIRED_REQUEST_NEW_MAIL
        );
      }
      throw err;
    }

    if (decode.purpose !== "verifyEmail") {
      return response(
        false,
        res,
        statusCode.FORBIDDEN,
        responseMessage.INVALID_TOKEN_FOR_ACTION
      );
    }

    const user = await findUserByEmail(decode.email);
    if (!user) {
      return response(
        false,
        res,
        statusCode.NOT_FOUND,
        responseMessage.USER_NOT_FOUND
      );
    }

    if (user.isVerified) {
      return response(
        false,
        res,
        statusCode.BAD_REQUEST,
        responseMessage.USER_ALREADY_VERIFIED
      );
    }

    user.isVerified = true;
    await user.save();

    return response(
      true,
      res,
      statusCode.SUCCESS,
      responseMessage.USER_VERIFIED
    );
  } catch (err) {
    return response(
      false,
      res,
      statusCode.BAD_REQUEST,
      responseMessage.FAILED_TO_VERIFY_USER
    );
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
      return response(
        false,
        res,
        statusCode.NOT_FOUND,
        responseMessage.INVALID_EMAIL
      );
    }

    if (!user.isVerified) {
      return response(
        false,
        res,
        statusCode.BAD_REQUEST,
        responseMessage.USER_NOT_VERIFIED
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return response(
        false,
        res,
        statusCode.UNAUTHORIZED,
        responseMessage.INVALID_PASSWORD
      );
    }

    const token = generateToken(
      { id: user._id, role: user.role },
      "1h",
      "login"
    );

    return response(
      true,
      res,
      statusCode.SUCCESS,
      responseMessage.LOGIN_SUCCESSFUL,
      token
    );
  } catch (err) {
    return response(false, res, statusCode.INTERNAL_SERVER_ERROR, err.message);
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await findUserByEmail(email);
    if (!user) {
      return response(
        false,
        res,
        statusCode.NOT_FOUND,
        responseMessage.INVALID_EMAIL
      );
    }

    if (!user.isVerified) {
      return response(
        false,
        res,
        statusCode.BAD_REQUEST,
        responseMessage.USER_NOT_VERIFIED
      );
    }

    const token = generateToken({ id: user._id }, "1h", "resetPassword");
    // Send reset password email
    const resetLink = `${process.env.BASE_URL}/auth/reset-password?token=${token}`;

    await sendEmail(
      email,
      "Reset Your Password",
      `Click here to reset: ${resetLink}`
    );

    return response(
      true,
      res,
      statusCode.SUCCESS,
      responseMessage.PASSWORD_RESET_LINK_SENT
    );
  } catch (err) {
    return response(false, res, statusCode.INTERNAL_SERVER_ERROR, err.message);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const { newPassword, confirmPassword } = req.body;

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    if (decode.purpose !== "resetPassword") {
      return response(
        false,
        res,
        statusCode.FORBIDDEN,
        responseMessage.INVALID_TOKEN_FOR_ACTION
      );
    }

    const user = await findUserById(decode.id);
    if (!user) {
      return response(
        false,
        res,
        statusCode.NOT_FOUND,
        responseMessage.USER_NOT_FOUND
      );
    }

    if (newPassword !== confirmPassword) {
      return response(
        false,
        res,
        statusCode.BAD_REQUEST,
        responseMessage.NEW_PASSWORD_AND_CONFIRM_PASSWORD_NOT_MATCH
      );
    }

    if (await bcrypt.compare(newPassword, user.password)) {
      return response(
        false,
        res,
        statusCode.BAD_REQUEST,
        responseMessage.NEW_PASSWORD_MUST_DIFFERENT_FROM_OLD_PASSWORD
      );
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    return response(
      true,
      res,
      statusCode.SUCCESS,
      responseMessage.PASSWORD_RESET
    );
  } catch (err) {
    return response(
      true,
      res,
      statusCode.BAD_REQUEST,
      responseMessage.INVALID_TOKEN
    );
  }
};

const changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
      return response(
        false,
        res,
        statusCode.NOT_FOUND,
        responseMessage.INVALID_EMAIL
      );
    }

    const comparePassword = await bcrypt.compare(oldPassword, user.password);
    if (!comparePassword) {
      return response(
        false,
        res,
        statusCode.BAD_REQUEST,
        responseMessage.INCORRECT_OLD_PASSWORD
      );
    }

    if (newPassword === oldPassword) {
      return response(
        false,
        res,
        statusCode.BAD_REQUEST,
        responseMessage.NEW_PASSWORD_MUST_DIFFERENT_FROM_OLD_PASSWORD
      );
    }

    if (newPassword !== confirmPassword) {
      return response(
        false,
        res,
        statusCode.BAD_REQUEST,
        responseMessage.NEW_PASSWORD_AND_CONFIRM_PASSWORD_NOT_MATCH
      );
    }

    await updateUserById(user._id, {
      password: await hashPassword(newPassword),
    });

    return response(
      true,
      res,
      statusCode.SUCCESS,
      responseMessage.PASSWORD_CHANGED
    );
  } catch (err) {
    return response(false, res, statusCode.INTERNAL_SERVER_ERROR, err.message);
  }
};

const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
      return response(
        false,
        res,
        statusCode.NOT_FOUND,
        responseMessage.INVALID_EMAIL
      );
    }

    if (user.isVerified) {
      return response(
        false,
        res,
        statusCode.BAD_REQUEST,
        responseMessage.USER_ALREADY_VERIFIED
      );
    }

    const token = generateToken({ email }, "1h", "verifyEmail");
    const verificationLink = `${process.env.BASE_URL}/auth/verify-email?token=${token}`;

    try {
      await sendEmail(
        email,
        "Verify Your Email",
        `Click here to verify: ${verificationLink}`
      );
    } catch (err) {
      return response(
        false,
        res,
        statusCode.INTERNAL_SERVER_ERROR,
        responseMessage.ERROR_WHILE_SEND_EMAIL
      );
    }

    return response(
      true,
      res,
      statusCode.SUCCESS,
      responseMessage.VERIFY_EMAIL_RESENT
    );
  } catch (err) {
    return response(false, res, statusCode.INTERNAL_SERVER_ERROR, err.message);
  }
};

const uploadImage = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await findUserById(userId);

    if (user.profilePicturePublicId) {
      await cloudinary.uploader.destroy(user.profilePicturePublicId);
    }

    const profilePicture = req.file.path;
    const profilePicturePublicId = req.file.filename;

    const updatedUser = await updateUserById(userId, {
      profilePicture,
      profilePicturePublicId,
    });

    if (!updatedUser) {
      return response(
        false,
        res,
        statusCode.NOT_FOUND,
        responseMessage.USER_NOT_FOUND
      );
    }

    return response(
      true,
      res,
      statusCode.SUCCESS,
      responseMessage.PROFILE_PICTURE_UPDATED,
      updatedUser
    );
  } catch (err) {
    return response(false, res, statusCode.INTERNAL_SERVER_ERROR, err.message);
  }
};

module.exports = {
  signup,
  verifyEmail,
  login,
  forgetPassword,
  resetPassword,
  changePassword,
  uploadImage,
  resendVerificationEmail,
};
