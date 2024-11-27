const schedule = require("node-schedule");
const Result = require("../models/resultModel");
const User = require("../models/userModel");
const Exam = require("../models/examModel");
const sendEmail = require("./sendEmail");

const scheduleEmail = () => {
  // Schedule a job to run every 5 minutes
  schedule.scheduleJob("*/5 * * * *", async () => {
    try {
      console.log("Running email scheduler...");

      // Find all results where the email is not sent yet
      const pendingResults = await Result.find({ status: "in-progress" });

      for (const result of pendingResults) {
        const sendTime = new Date(
          result.createdAt.getTime() +  6 * 60 * 1000
        );

        if (sendTime <= new Date()) {
          const student = await User.findById(result.studentId);
          const exam = await Exam.findById(result.examId);

          await sendEmail(
            student.email,
            "Your Exam Result",
            `You scored ${result.score} in the ${exam.subjectName} exam.`
          );

          result.status = "completed";
          await result.save();

          console.log(`Email sent to ${student.email}`);
        }
      }
    } catch (error) {
      console.error("Error in email scheduler:", error.message);
    }
  });
};

module.exports = scheduleEmail;
