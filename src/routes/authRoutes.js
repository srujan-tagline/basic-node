const express = require("express");
const {
  signup,
  verifyEmail,
  login,
  forgetPassword,
  resetPassword,
  changePassword,
  resendVerificationEmail
} = require("../controllers/authController");
const {
  signupSchema,
  loginSchema,
  changePasswordSchema,
  resetPasswordSchema,
  emailVerificationSchema,
} = require("../validators/authValidation");
const validate = require("../middlewares/validate");

const router = express.Router();

router.post("/signup", validate(signupSchema), signup);
router.get("/verify-email", verifyEmail);
router.post("/login", validate(loginSchema), login);
router.post(
  "/forget-password",
  validate(emailVerificationSchema),
  forgetPassword
);
router.post("/reset-password", validate(resetPasswordSchema) ,resetPassword);
router.post("/change-password", validate(changePasswordSchema) ,changePassword);
router.post("/resend-verification-email", validate(emailVerificationSchema), resendVerificationEmail);

module.exports = router;
