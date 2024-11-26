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
  authorizeStudent,
} = require("../middlewares/authMiddleware");

router.post(
  "/exams/start",
  authenticateUser,
  authorizeStudent,
  validate(startExamSchema),
  startExam
);
router.post(
  "/exams/submit",
  authenticateUser,
  authorizeStudent,
  validate(submitExamSchema),
  submitExam
);

router.post(
  "/upload-profile-picture",
  authenticateUser,
  authorizeStudent,
  upload.single("profilePicture"),
  uploadImage
);

router.get("/given-exams", authenticateUser, authorizeStudent, getGivenExams);

router.put(
  "/edit-profile",
  authenticateUser,
  authorizeStudent,
  validate(updateProfileSchema),
  editProfile
);

module.exports = router;
