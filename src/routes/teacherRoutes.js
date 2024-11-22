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
const {
  authenticateUser,
  authorizeTeacher,
} = require("../middlewares/authMiddleware");
const {
  createExamSchema,
  updateExamSchema,
} = require("../validators/examValidation");
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

module.exports = router;
