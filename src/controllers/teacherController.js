const User = require("../models/userModel");
const Exam = require("../models/examModel");
const Result = require("../models/resultModel");
const mongoose = require("mongoose");

const listAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("-password")
      .sort({ createdAt: -1 });
    return res.json({ students });
  } catch (err) {
    return res.status(500).json({ error: "Failed to retrieve students." });
  }
};

const listExamGivenStudents = async (req, res) => {
  try {
    const students = await Result.aggregate([
      {
        $group: {
          _id: "$studentId",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "studentDetails",
        },
      },
      {
        $unwind: "$studentDetails",
      },
      {
        $project: {
          _id: 0,
          studentId: "$studentDetails._id",
          name: "$studentDetails.name",
          email: "$studentDetails.email",
          role: "$studentDetails.role",
        },
      },
    ]);

    if (!students.length) {
      return res
        .status(404)
        .json({ message: "No students have given any exams yet." });
    }

    return res.json({ students });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to retrieve students who have given exams." });
  }
};

const getStudentDetails = async (req, res) => {
  try {
    const { studentId } = req.params;

    const studentDetails = await User.findById(studentId).select("-password");
    if (!studentDetails) {
      return res.status(404).json({ message: "Student not found." });
    }

    const results = await Result.aggregate([
      {
        $match: { studentId: new mongoose.Types.ObjectId(studentId) },
      },
      {
        $lookup: {
          from: "exams",
          localField: "examId",
          foreignField: "_id",
          as: "examDetails",
        },
      },
      {
        $unwind: {
          path: "$examDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          examId: 1,
          subjectName: "$examDetails.subjectName",
          result: {
            totalQuestions: { $size: "$examDetails.questions" },
            score: "$score",
            percentage: {
              $multiply: [
                { $divide: ["$score", { $size: "$examDetails.questions" }] },
                100,
              ],
            },
          },
          rank: 1,
          status: 1,
        },
      },
      {
        $sort: { score: -1 },
      },
    ]);

    const response = {
      ...studentDetails.toObject(),
      givenExams: results,
    };

    return res.status(200).json(response);
  } catch (err) {
    return res.status(500).json({
      error: "Failed to retrieve student details.",
      details: err.message,
    });
  }
};

const createExam = async (req, res) => {
  try {
    const { subjectName, questions } = req.body;

    const existingExam = await Exam.findOne({ subjectName });
    if (existingExam) {
      return res.status(400).json({ error: "Subject name must be unique." });
    }

    const newExam = new Exam({ subjectName, questions });
    await newExam.save();

    return res
      .status(201)
      .json({ message: "Exam created successfully.", exam: newExam });
  } catch (err) {
    return res.status(500).json({ error: "Failed to create exam." });
  }
};

const listExams = async (req, res) => {
  try {
    const exams = await Exam.find({}).sort("subjectName");
    return res.json({ exams });
  } catch (err) {
    return res.status(500).json({ error: "Failed to retrieve exams." });
  }
};

const getExamDetails = async (req, res) => {
  try {
    const { examId } = req.params;
    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({ error: "Exam not found." });
    }

    return res.json({ exam });
  } catch (err) {
    return res.status(500).json({ error: "Failed to retrieve exam details." });
  }
};

const editExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { subjectName, questions } = req.body;

    const updatedExam = await Exam.findOneAndUpdate(
      { _id: examId },
      { $set: { subjectName, questions } },
      { new: true }
    );

    if (!updatedExam) {
      return res.status(404).json({ error: "Exam not found." });
    }

    return res.json({
      message: "Exam updated successfully.",
      exam: updatedExam,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update exam." });
  }
};

const deleteExam = async (req, res) => {
  try {
    const { examId } = req.params;

    const deletedExam = await Exam.findOneAndUpdate(
      { _id: examId },
      { $set: { isDeleted: true } },
      { new: true }
    );
    if (!deletedExam) {
      return res.status(404).json({ error: "Exam not found." });
    }

    return res.json({ message: "Exam deleted successfully." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete exam." });
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