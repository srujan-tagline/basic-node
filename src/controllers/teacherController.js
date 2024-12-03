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
const { statusCode, responseMessage } = require("../utils/constant");
const { response } = require("../utils/common");

const listAllStudents = async (req, res) => {
  try {
    const students = await findStudents();
    return response(
      true,
      res,
      statusCode.SUCCESS,
      responseMessage.STUDENT_RETRIEVED,
      students
    );
  } catch (err) {
    return response(false, res, statusCode.INTERNAL_SERVER_ERROR, err.message);
  }
};

const listExamGivenStudents = async (req, res) => {
  try {
    const students = await getAllExamGivenStudents();

    if (!students.length) {
      return response(
        false,
        res,
        statusCode.NOT_FOUND,
        responseMessage.NO_STUDENT_GIVE_EXAM
      );
    }

    return response(
      true,
      res,
      statusCode.SUCCESS,
      responseMessage.STUDENT_RETRIEVED,
      students
    );
  } catch (err) {
    return response(false, res, statusCode.INTERNAL_SERVER_ERROR, err.message);
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
      return response(
        false,
        res,
        statusCode.NOT_FOUND,
        responseMessage.STUDENT_NOT_FOUND
      );
    }

    const results = await getResultsByStudentId(studentId);

    const response = {
      ...studentDetails.toObject(),
      givenExams: results,
    };

    return response(
      true,
      res,
      statusCode.SUCCESS,
      responseMessage.STUDENT_DETAILS_RETRIEVED,
      response
    );
  } catch (err) {
    return response(true, res, statusCode.INTERNAL_SERVER_ERROR, err.message);
  }
};

const createExam = async (req, res) => {
  try {
    const { subjectName, questions } = req.body;

    const existingExam = await findExamBySubject(subjectName);
    if (existingExam) {
      return response(
        false,
        res,
        statusCode.BAD_REQUEST,
        responseMessage.SUBJECT_MUST_BE_UNIQUE
      );
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

    return response(
      true,
      res,
      statusCode.CREATED,
      responseMessage.EXAM_CREATED,
      newExam
    );
  } catch (err) {
    return response(false, res, statusCode.INTERNAL_SERVER_ERROR, err.message);
  }
};

const listExams = async (req, res) => {
  try {
    const exams = await listAllExams();

    return response(
      true,
      res,
      statusCode.SUCCESS,
      responseMessage.EXAM_RETRIEVED,
      exams
    );
  } catch (err) {
    return response(false, res, statusCode.INTERNAL_SERVER_ERROR, err.message);
  }
};

const getExamDetails = async (req, res) => {
  try {
    const { examId } = req.params;
    const exam = await findExamById(examId);

    if (!exam) {
      return response(
        false,
        res,
        statusCode.NOT_FOUND,
        responseMessage.EXAM_NOT_FOUND
      );
    }

    return response(
      true,
      res,
      statusCode.SUCCESS,
      responseMessage.EXAM_RETRIEVED,
      exam
    );
  } catch (err) {
    return response(false, res, statusCode.INTERNAL_SERVER_ERROR, err.message);
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
      return response(
        false,
        res,
        statusCode.NOT_FOUND,
        responseMessage.EXAM_NOT_FOUND
      );
    }

    return response(
      true,
      res,
      statusCode.SUCCESS,
      responseMessage.EXAM_UPDATED,
      updatedExam
    );
  } catch (err) {
    return response(false, res, statusCode.INTERNAL_SERVER_ERROR, err.message);
  }
};

const deleteExam = async (req, res) => {
  try {
    const { examId } = req.params;

    const deletedExam = await updateExamById(examId, { isDeleted: true });
    if (!deletedExam) {
      return response(
        false,
        res,
        statusCode.NOT_FOUND,
        responseMessage.EXAM_NOT_FOUND
      );
    }

    return response(
      true,
      res,
      statusCode.SUCCESS,
      responseMessage.EXAM_DELETED
    );
  } catch (err) {
    return response(false, res, statusCode.INTERNAL_SERVER_ERROR, err.message);
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
