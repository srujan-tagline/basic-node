const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  subjectName: {
    type: String,
    required: true,
    unique: true,
  },
  questions: [
    {
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
    },
  ],
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Exam", examSchema);
