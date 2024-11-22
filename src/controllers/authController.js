const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");
const { generateToken } = require("../utils/generateToken");
const { hashPassword } = require("../utils/hashPassword");

const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await hashPassword(password);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: false,
    });

    await user.save();

    const token = generateToken({ email }, "1h");
    // Send verification email
    const verificationLink = `${process.env.BASE_URL}/auth/verify-email?token=${token}`;

    await sendEmail(
      email,
      "Verify Your Email",
      `Click here to verify: ${verificationLink}`
    );

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

    const decode = jwt.verify(token, process.env.JWT_SECRET);
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
    return res.status(400).json({ message: "Invalid or expired token" });
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
      return res.status(400).json({ message: "Email not verified" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken({ id: user._id, role: user.role });

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

    const token = generateToken({ id: user._id }, "1h");
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
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decode.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = await hashPassword(password);
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
};

module.exports = {
  signup,
  verifyEmail,
  login,
  forgetPassword,
  resetPassword,
};
