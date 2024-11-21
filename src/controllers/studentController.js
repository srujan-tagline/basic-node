const Exam = require("../models/examModel");
const Result = require("../models/resultModel")
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");
const {hashPassword} = require("../utils/hashPassword");
const mongoose = require("mongoose");

const startExam = async (req, res) => {
  try {
    const { subjectName } = req.body;
    const studentId = req.user._id;

    // Validate if the exam exists
    const exam = await Exam.findOne(
      { subjectName, isDeleted: false },
      { "questions.correctAnswer": 0 }
    );
    if (!exam) {
      return res.status(404).json({ message: "Exam not found." });
    }

    // Check if the student already gave this exam
    const existingResult = await Result.findOne({
      examId: exam._id,
      studentId,
    });
    if (existingResult) {
      return res
        .status(400)
        .json({ message: "You have already given this exam." });
    }

    return res.status(200).json({
      message: "You can start the exam.",
      questions: exam.questions,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

const submitExam = async (req, res) => {
  try {
    const { examId, answers } = req.body;
    const studentId = req.user._id;
    const studentEmail = req.user.email;

    // Validate if the exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found." });
    }

    const alreadySubmit = await Result.findOne({
      examId: exam._id,
      studentId,
    });
    if (alreadySubmit) {
      return res
        .status(400)
        .json({ message: "You have already submit this exam." });
    }

    // Calculate score
    let score = 0;
    for (const answer of answers) {
      const question = exam.questions.id(answer.questionId);
      if (!question) {
        return res.status(400).json({ message: "Invalid question ID." });
      }

      // Ensure the selected option is valid
      if (!question.options.includes(answer.selectedOption)) {
        return res.status(400).json({
          message: `Invalid selected option for question: ${question.questionText}`,
        });
      }

      // Check if the selected option is correct
      if (question.correctAnswer === answer.selectedOption) {
        score += 1;
      }
    }

    // Fetch existing results for the same exam to calculate rank
    const existingResults = await Result.find({ examId }).sort({ score: -1 });

    // Determine the student's rank
    let rank = 1;

    for (const result of existingResults) {
      if (score < result.score) {
        rank++;
      } else if (score === result.score) {
        rank = result.rank;
        break;
      } else if (score > result.score) {
        await Result.updateOne(
          { _id: result._id }, 
          { $inc: { rank: 1 } }
        );
      } else{
        break;
      }
    }

    // Save result with "in-progress" status
    const result = new Result({
      examId,
      studentId,
      answers,
      score,
      rank,
    });
    await result.save();

    setTimeout(async () => {
      result.status = "completed";
      await result.save();

      await sendEmail(
        studentEmail,
        "Your Exam Result",
        `You scored ${score} in the ${exam.subjectName} exam.`
      );
    }, 20000);

    return res.status(200).json({ message: "Exam submitted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

const getGivenExams = async (req, res) => {
  try {
    const studentId = req.user._id;

    const givenExams = await Result.aggregate([
      {
        $match: {
          studentId: new mongoose.Types.ObjectId(studentId),
          status: "completed"
        },
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
        $unwind: "$examDetails",
      },
      {
        $match: { "examDetails.isDeleted": false },
      },
      {
        $project: {
          _id: 0,
          examId: 1,
          subjectName: "$examDetails.subjectName",
          score: 1,
          rank: 1,
          status: 1,
        },
      },
    ]);

    if (givenExams.length === 0) {
      return res
        .status(200)
        .json({ message: "No exams given yet.", givenExams: [] });
    }

    return res.status(200).json({ givenExams });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve given exams.",
      error: error.message,
    });
  }
};

const editProfile = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { name, email, password } = req.body;

    if (email) {
      const emailExists = await User.findOne({
        email: email,
        _id: { $ne: studentId },
      });
      if (emailExists) {
        return res
          .status(400)
          .json({ message: "Email already in use by another account." });
      }
    }
    
    let updatedData = { name, email };
     if (password) {
       updatedData.password = await hashPassword(password);
     }

    const updatedUser = await User.findOneAndUpdate(
      { _id: studentId },
      { $set: updatedData },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Student not found." });
    }

    return res
      .status(200)
      .json({ message: "Profile updated successfully.", user: updatedUser });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update profile.",
      error: error.message,
    });
  }
};

module.exports = {startExam, submitExam, getGivenExams, editProfile};
