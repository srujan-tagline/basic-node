const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");
const { generateToken } = require("../utils/generateToken");
const { hashPassword } = require("../utils/hashPassword");
const cloudinary = require("../../config/cloudinary");
require("dotenv").config();

const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await hashPassword(password);

    await User.create({
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
      return res.status(201).json({
        message:
          "Signup successful, but verifiction email could not be send. Please try again later.",
      });
    }

    return res
      .status(201)
      .json({ message: "Signup successful. Verification email sent." });
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
        return res.status(400).json({
          message: "Token expired. Please request a new verification email.",
        });
      }
      throw err;
    }

    if (decode.purpose !== "verifyEmail") {
      return res.status(403).json({ message: "Invalid token for this action" });
    }

    const user = await User.findOne({ email: decode.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    user.isVerified = true;
    await user.save();

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    return res.status(400).json({ message: "Failed to verify email" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "User not verified" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(
      { id: user._id, role: user.role },
      "1h",
      "login"
    );

    return res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isVerified) {
      return res.status(400).json({ message: "User not verified" });
    }

    const token = generateToken({ id: user._id }, "1h", "resetPassword");
    // Send reset password email
    const resetLink = `${process.env.BASE_URL}/auth/reset-password?token=${token}`;

    await sendEmail(
      email,
      "Reset Your Password",
      `Click here to reset: ${resetLink}`
    );
    return res
      .status(200)
      .json({ message: "Password reset link sent to email" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const { newPassword, confirmPassword } = req.body;

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    if (decode.purpose !== "resetPassword") {
      return res.status(403).json({ message: "Invalid token for this action" });
    }

    const user = await User.findById(decode.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirm password do not match" });
    }

    if (await bcrypt.compare(newPassword, user.password)) {
      return res.status(400).json({
        message: "New password must be different from the old password",
      });
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const comparePassword = await bcrypt.compare(oldPassword, user.password);
    if (!comparePassword) {
      return res.status(400).json({ message: "Old Password is incorrect" });
    }

    if (newPassword === oldPassword) {
      return res.status(400).json({
        message: "New password must be different from the old password",
      });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "New password and Confirm password do not match" });
    }

    await User.findOneAndUpdate(
      { email: email },
      { $set: { password: await hashPassword(newPassword) } }
    );

    return res.status(200).json({ message: "Password change successful" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified" });
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
      return res.status(500).json({ message: "Error while sending email" });
    }

    return res
      .status(200)
      .json({ message: "Verification email sent successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const uploadImage = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (user.profilePicturePublicId) {
      await cloudinary.uploader.destroy(user.profilePicturePublicId);
    }

    const profilePicture = req.file.path;
    const profilePicturePublicId = req.file.filename;

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { profilePicture, profilePicturePublicId },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile picture updated successfully.",
      user: updatedUser,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Failed to upload profile picture.",
      details: err,
    });
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
