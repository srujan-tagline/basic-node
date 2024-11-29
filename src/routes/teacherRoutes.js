const express = require("express");
const {
  listAllStudents,
  listExamGivenStudents,
  getStudentDetails,
  listExams,
  getExamDetails,
  createExam,
  editExam,
  deleteExam,
} = require("../controllers/teacherController");
const { uploadImage } = require("../controllers/authController");
const {
  authenticateUser,
  authorizeRole
} = require("../middlewares/authMiddleware");
const {
  createExamSchema,
  updateExamSchema,
} = require("../validators/examValidation");
const upload = require("../middlewares/cloudinaryUpload");
const validate = require("../middlewares/validate");

const router = express.Router();

// Teacher dashboard routes
router.get("/students", authenticateUser, authorizeRole(["teacher"]), listAllStudents);
router.get(
  "/students/exam-given",
  authenticateUser,
  authorizeRole(["teacher"]),
  listExamGivenStudents
);
router.get(
  "/students/:studentId",
  authenticateUser,
  authorizeRole(["teacher"]),
  getStudentDetails
);

router.post(
  "/exams",
  authenticateUser,
  authorizeRole(["teacher"]),
  validate(createExamSchema),
  createExam
);
router.get("/exams", authenticateUser, authorizeRole(["teacher"]), listExams);
router.get(
  "/exams/:examId",
  authenticateUser,
  authorizeRole(["teacher"]),
  getExamDetails
);
router.put(
  "/exams/:examId",
  authenticateUser,
  authorizeRole(["teacher"]),
  validate(updateExamSchema),
  editExam
);
router.delete("/exams/:examId", authenticateUser, authorizeRole(["teacher"]), deleteExam);
router.post(
  "/upload-profile-picture",
  authenticateUser,
  authorizeRole(["teacher"]),
  upload.single("profilePicture"),
  uploadImage
);

module.exports = router;
