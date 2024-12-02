const { hashPassword } = require("../utils/common");
const {
  findExamBySubjectName,
  findExamById,
} = require("../services/examService");
const {
  findResultByExamAndStudent,
  createResult,
  getGivenExamsByStudentId,
} = require("../services/resultService");
const {statusCode, responseMessage} = require("../utils/constant");
const {response} = require("../utils/common");
const { findUserByEmail, updateUserById } = require("../services/userService");

const startExam = async (req, res) => {
  try {
    const { subjectName } = req.body;
    const studentId = req.user._id;

    const exam = await findExamBySubjectName(subjectName);
    if (!exam) {
      return response(
        false,
        res,
        statusCode.NOT_FOUND,
        responseMessage.EXAM_NOT_FOUND
      );
    }

    const existingResult = await findResultByExamAndStudent(
      exam._id,
      studentId
    );
    if (existingResult) {
      return response(
        false,
        res,
        statusCode.BAD_REQUEST,
        responseMessage.ALREADY_GIVEN_EXAM
      );
    }

      return response(
        true,
        res,
        statusCode.SUCCESS,
        responseMessage.START_EXAM,
        exam.questions
      );
  } catch (error) {
      return response(
        false,
        res,
        statusCode.INTERNAL_SERVER_ERROR,
        error.message
      );
  }
};

const submitExam = async (req, res) => {
  try {
    const { examId, answers } = req.body;
    const studentId = req.user._id;

    const exam = await findExamById(examId);
    if (!exam) {
      return response(
        false,
        res,
        statusCode.NOT_FOUND,
        responseMessage.EXAM_NOT_FOUND
      );
    }

    const alreadySubmit = await findResultByExamAndStudent(exam._id, studentId);
    if (alreadySubmit) {
      return response(
        false,
        res,
        statusCode.BAD_REQUEST,
        responseMessage.ALREADY_SUBMIT_EXAM
      );
    }

    let score = 0;
    for (const answer of answers) {
      const question = exam.questions.id(answer.questionId);
      if (!question) {
        return response(
          false,
          res,
          statusCode.BAD_REQUEST,
          responseMessage.INVALID_QUESTION_ID
        );
      }

      if (!question.options.includes(answer.selectedOption)) {
        return res.status(400).json({
          message: `Invalid selected option for question: ${question.questionText}`,
        });
      }

      if (question.correctAnswer === answer.selectedOption) {
        score += 1;
      }
    }

    if (!(exam.questions.length === answers.length)) {
      return response(
        false,
        res,
        statusCode.BAD_REQUEST,
        responseMessage.ATTEMPT_ALL_QUESTION
      );
    }

    await createResult({
      examId,
      studentId,
      answers,
      score,
    });

    return response(
      true,
      res,
      statusCode.SUCCESS,
      responseMessage.EXAM_SUBMITTED
    );
  } catch (error) {
    return response(
      false,
      res,
      statusCode.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

const getGivenExams = async (req, res) => {
  try {
    const studentId = req.user._id;

    const givenExams = await getGivenExamsByStudentId(studentId);

    return response(
      true,
      res,
      statusCode.SUCCESS,
      responseMessage.RETRIEVED_GIVEN_EXAM,
      givenExams
    );
  } catch (error) {
    return response(
      false,
      res,
      statusCode.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

const editProfile = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { name, email, password } = req.body;

    if (email) {
      const emailExists = await findUserByEmail(email);
      if (emailExists && emailExists._id.toString() !== studentId.toString()) {
        return response(
          false,
          res,
          statusCode.BAD_REQUEST,
          responseMessage.EMAIL_ALREADY_USE
        );
      }
    }

    let updatedData = { name, email };
    if (password) {
      updatedData.password = await hashPassword(password);
    }

    const updatedUser = await updateUserById(studentId, updatedData);

    if (!updatedUser) {
      return response(
        false,
        res,
        statusCode.NOT_FOUND,
        responseMessage.STUDENT_NOT_FOUND
      );
    }

    return response(
      true,
      res,
      statusCode.SUCCESS,
      responseMessage.PROFILE_UPDATED,
      updatedUser
    );
  } catch (error) {
    return response(
      false,
      res,
      statusCode.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

module.exports = { startExam, submitExam, getGivenExams, editProfile };
