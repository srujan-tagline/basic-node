const express = require("express");
const router = express.Router();
const { startExam, submitExam } = require("../controllers/studentController");
const {
  startExamSchema,
  submitExamSchema,
} = require("../validators/resultValidation");
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

module.exports = router;
