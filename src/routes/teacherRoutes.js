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
  authorizeTeacher,
} = require("../middlewares/authMiddleware");
const {
  createExamSchema,
  updateExamSchema,
} = require("../validators/examValidation");
const upload = require("../middlewares/cloudinaryUpload");
const validate = require("../middlewares/validate");

const router = express.Router();

// Teacher dashboard routes
router.get("/students", authenticateUser, authorizeTeacher, listAllStudents);
router.get(
  "/students/exam-given",
  authenticateUser,
  authorizeTeacher,
  listExamGivenStudents
);
router.get(
  "/students/:studentId",
  authenticateUser,
  authorizeTeacher,
  getStudentDetails
);

router.post(
  "/exams",
  authenticateUser,
  authorizeTeacher,
  validate(createExamSchema),
  createExam
);
router.get("/exams", authenticateUser, authorizeTeacher, listExams);
router.get(
  "/exams/:examId",
  authenticateUser,
  authorizeTeacher,
  getExamDetails
);
router.put(
  "/exams/:examId",
  authenticateUser,
  authorizeTeacher,
  validate(updateExamSchema),
  editExam
);
router.delete("/exams/:examId", authenticateUser, authorizeTeacher, deleteExam);
router.post(
  "/upload-profile-picture",
  authenticateUser,
  authorizeTeacher,
  upload.single("profilePicture"),
  uploadImage
);

module.exports = router;
