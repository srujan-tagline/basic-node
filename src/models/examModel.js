const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
  },
  correctAnswer: {
    type: String,
    required: true,
  },
});

const examSchema = new mongoose.Schema({
  subjectName: {
    type: String,
    required: true,
    unique: true,
  },
  questions: [questionSchema],
  isDeleted: {
    type: Boolean,
    default: false,
  }
});

module.exports = mongoose.model("Exam", examSchema);
