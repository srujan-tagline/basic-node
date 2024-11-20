const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  answers: [
    {
      questionId: mongoose.Schema.Types.ObjectId,
      selectedOption: String,
    },
  ],
  score: {
    type: Number,
    required: true,
  },
  rank: {
    type: Number
  }
});

module.exports = mongoose.model("Result", resultSchema);
