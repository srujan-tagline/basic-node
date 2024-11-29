const express = require("express");
const router = express.Router();
const {
  startExam,
  submitExam,
  getGivenExams,
  editProfile,
} = require("../controllers/studentController");
const {uploadImage} = require("../controllers/authController");
const {
  startExamSchema,
  submitExamSchema,
} = require("../validators/resultValidation");
const { updateProfileSchema } = require("../validators/userValidation");
const upload = require("../middlewares/cloudinaryUpload");
const validate = require("../middlewares/validate");
const {
  authenticateUser,
  authorizeRole
} = require("../middlewares/authMiddleware");

router.post(
  "/exams/start",
  authenticateUser,
  authorizeRole(["student"]),
  validate(startExamSchema),
  startExam
);
router.post(
  "/exams/submit",
  authenticateUser,
  authorizeRole(["student"]),
  validate(submitExamSchema),
  submitExam
);

router.post(
  "/upload-profile-picture",
  authenticateUser,
  authorizeRole(["student"]),
  upload.single("profilePicture"),
  uploadImage
);

router.get("/given-exams", authenticateUser, authorizeRole(["student"]), getGivenExams);

router.put(
  "/edit-profile",
  authenticateUser,
  authorizeRole(["student"]),
  validate(updateProfileSchema),
  editProfile
);

module.exports = router;
