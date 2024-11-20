const Exam = require("../models/examModel");
// const Result = require("../models/resultModel");
const Result = require("../models/resultModel")
const sendEmail = require("../utils/sendEmail");

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
    // const existingResult = await Result.findOne({
    //   examId: exam._id,
    //   studentId,
    // });
    // if (existingResult) {
    //   return res
    //     .status(400)
    //     .json({ message: "You have already given this exam." });
    // }

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

    // Validate if the exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found." });
    }

    // Calculate score
    let score = 0;
    for (const answer of answers) {
      const question = exam.questions.id(answer.questionId);
      if (question && question.correctAnswer === answer.selectedOption) {
        score += 1;
      }
    }

    // Save result with "in-progress" status
    const result = new Result({
      examId,
      studentId,
      answers,
      score,
    });
    await result.save();

    // Schedule email to be sent after delay
    setTimeout(async () => {
      // Update result to "completed"
      result.status = "completed";
      await result.save();

      // Send email with result details
      await sendEmail({
        to: req.user.email,
        subject: "Your Exam Result",
        text: `You scored ${score} in the ${exam.subjectName} exam.`,
      });
    }, 2 * 60 * 60 * 1000); // Delay of 2 hours

    return res.status(200).json({ message: "Exam submitted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

module.exports = {startExam, submitExam};

// {
//   "examId": "673dab75aa797c0c0837d74b",
//   "answers": [
//     {
//       "questionId": "673daed043f10715176856fe",  
//       "selectedOption": "2"  
//     },
//     {
//       "questionId": "673daed043f10715176856ff",
//       "selectedOption": "3"  
//     },
//     {
//       "questionId": "673daed043f1071517685700",
//       "selectedOption": "56"
//     },
//     {
//       "questionId": "673daed043f1071517685701",
//       "selectedOption": "2x"
//     },
//     {
//       "questionId": "673daed043f1071517685702",
//       "selectedOption": "3.12"  
//     }
//   ]
// }
