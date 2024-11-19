const express = require("express");
const {
  signup,
  verifyEmail,
  login,
  forgetPassword,
  resetPassword,
} = require("../controllers/authController");
const {
  signupSchema,
  loginSchema,
  emailVerificationSchema,
} = require("../validators/authValidation");
const validate = require("../middlewares/validate");

const router = express.Router();

router.post("/signup", validate(signupSchema), signup);
router.get("/verify-email", validate(emailVerificationSchema), verifyEmail);
router.post("/login", validate(loginSchema), login);
router.post(
  "/forget-password",
  validate(emailVerificationSchema),
  forgetPassword
);
router.post("/reset-password", resetPassword);

module.exports = router;
