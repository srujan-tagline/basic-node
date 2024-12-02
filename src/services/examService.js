const Exam = require("../models/examModel");

const findExamBySubjectName = async (subjectName) => {
  try {
    return await Exam.findOne(
      { subjectName, isDeleted: false },
      { "questions.correctAnswer": 0 }
    );
  } catch (error) {
    return null;
  }
};

const findExamById = async (examId) => {
  try {
    return await Exam.findById(examId);
  } catch (error) {
    return null;
  }
};

const findExamBySubject = async (subjectName) => {
  try {
    return await Exam.findOne({ subjectName });
  } catch (error) {
    return null;
  }
};

const examCreate = async (examData) => {
  try {
    return await Exam.create(examData);
  } catch (error) {
    return null;
  }
};

const listAllExams = async () => {
  try {
    return await Exam.find({}).sort("subjectName");
  } catch (error) {
    return null;
  }
};

const updateExamById = async (id, updateData) => {
  try {
    return await Exam.findOneAndUpdate({ _id: id }, updateData, { new: true });
  } catch (error) {
    return null;
  }
};

module.exports = {
  findExamBySubjectName,
  findExamById,
  findExamBySubject,
  examCreate,
  listAllExams,
  updateExamById,
};
