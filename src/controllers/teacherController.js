const {
  findStudents,
  findUserByIdWithExclusion,
} = require("../services/userService");
const {
  getAllExamGivenStudents,
  getResultsByStudentId,
} = require("../services/resultService");
const {
  findExamById,
  findExamBySubject,
  examCreate,
  listAllExams,
  updateExamById,
} = require("../services/examService");

const listAllStudents = async (req, res) => {
  try {
    const students = await findStudents();
    return res
      .status(200)
      .json({ message: "User retrieved successfully.", data: students });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const listExamGivenStudents = async (req, res) => {
  try {
    const students = await getAllExamGivenStudents();

    if (!students.length) {
      return res
        .status(404)
        .json({ message: "No students have given any exams yet." });
    }

    return res
      .status(200)
      .json({ message: "Students retrieved successfully.", students });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getStudentDetails = async (req, res) => {
  try {
    const { studentId } = req.params;

    const studentDetails = await findUserByIdWithExclusion(
      studentId,
      "-password"
    );
    if (!studentDetails) {
      return res.status(404).json({ message: "Student is not found." });
    }

    const results = await getResultsByStudentId(studentId);

    const response = {
      ...studentDetails.toObject(),
      givenExams: results,
    };

    return res
      .status(200)
      .json({ message: "Student details retrieved successfully.", response });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

const createExam = async (req, res) => {
  try {
    const { subjectName, questions } = req.body;

    const existingExam = await findExamBySubject(subjectName);
    if (existingExam) {
      return res.status(400).json({ message: "Subject name must be unique." });
    }

    for (const question of questions) {
      if (!question.options.includes(question.correctAnswer)) {
        return res.status(400).json({
          message: `Correct answer "${
            question.correctAnswer
          }" must be one of the options: ${question.options.join(", ")}.`,
        });
      }
    }

    const newExam = await examCreate({ subjectName, questions });

    return res
      .status(201)
      .json({ message: "Exam created successfully.", exam: newExam });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const listExams = async (req, res) => {
  try {
    const exams = await listAllExams();
    return res
      .status(200)
      .json({ message: "Exams retrieved successfully", exams });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getExamDetails = async (req, res) => {
  try {
    const { examId } = req.params;
    const exam = await findExamById(examId);

    if (!exam) {
      return res.status(404).json({ error: "Exam is not found." });
    }

    return res
      .status(200)
      .json({ message: "Exam Details retrieved successfully", exam });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const editExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { subjectName, questions } = req.body;

    const updatedExam = await updateExamById(examId, {
      subjectName,
      questions,
    });

    if (!updatedExam) {
      return res.status(404).json({ message: "Exam is not found." });
    }

    return res.status(200).json({
      message: "Exam is updated successfully.",
      exam: updatedExam,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const deleteExam = async (req, res) => {
  try {
    const { examId } = req.params;

    const deletedExam = await updateExamById(examId, { isDeleted: true });
    if (!deletedExam) {
      return res.status(404).json({ message: "Exam is not found." });
    }

    return res.status(200).json({ message: "Exam is deleted successfully." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  listAllStudents,
  listExamGivenStudents,
  getStudentDetails,
  listExams,
  getExamDetails,
  createExam,
  editExam,
  deleteExam,
};
