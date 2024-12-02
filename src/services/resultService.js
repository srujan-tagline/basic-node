const Result = require("../models/resultModel");
const mongoose = require("mongoose");

const findResultByExamAndStudent = async (examId, studentId) => {
    try {
        
    
  return await Result.findOne({ examId, studentId });} catch (error) {
        return null;
    }
};

const createResult = async (resultData) => {
    try {
        
    
  return await Result.create(resultData);} catch (error) {
        return null;
    }
};

const getGivenExamsByStudentId = async (studentId) => {
    try {
        
    
  return await Result.aggregate([
    {
      $match: {
        studentId: new mongoose.Types.ObjectId(studentId),
        status: "completed",
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
    { $unwind: "$examDetails" },
    {
      $match: { "examDetails.isDeleted": false },
    },
    {
      $lookup: {
        from: "results",
        let: { examId: "$examId" },
        pipeline: [
          { $match: { $expr: { $eq: ["$examId", "$$examId"] } } },
          { $sort: { score: -1 } },
          {
            $group: {
              _id: "$score",
              students: { $push: "$studentId" },
            },
          },
          { $sort: { _id: -1 } },
          {
            $group: {
              _id: null,
              ranks: {
                $push: {
                  score: "$_id",
                  students: "$students",
                },
              },
            },
          },
          { $unwind: { path: "$ranks", includeArrayIndex: "rank" } },
          { $unwind: "$ranks.students" },
          {
            $project: {
              studentId: "$ranks.students",
              score: "$ranks.score",
              rank: { $add: ["$rank", 1] },
            },
          },
        ],
        as: "rankDetails",
      },
    },
    {
      $project: {
        _id: 0,
        examId: 1,
        subjectName: "$examDetails.subjectName",
        score: 1,
        rank: {
          $arrayElemAt: [
            "$rankDetails.rank",
            {
              $indexOfArray: ["$rankDetails.studentId", studentId],
            },
          ],
        },
        status: 1,
      },
    },
  ]);} catch (error) {
        return null;
    }
};

const getAllExamGivenStudents = async () => {
    try {
        
    
    return await Result.aggregate([
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
    ]);} catch (error) {
        return null;
    }
}

const getResultsByStudentId = async (studentId) => {
    try {
    return await Result.aggregate([
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
      { $unwind: "$examDetails" },
      {
        $lookup: {
          from: "results",
          let: { examId: "$examId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$examId", "$$examId"] } } },
            { $sort: { score: -1 } },
            {
              $group: {
                _id: "$score",
                students: { $push: "$studentId" },
              },
            },
            { $sort: { _id: -1 } },
            {
              $group: {
                _id: null,
                ranks: {
                  $push: {
                    score: "$_id",
                    students: "$students",
                  },
                },
              },
            },
            { $unwind: { path: "$ranks", includeArrayIndex: "rank" } },
            { $unwind: "$ranks.students" },
            {
              $project: {
                studentId: "$ranks.students",
                score: "$ranks.score",
                rank: { $add: ["$rank", 1] },
              },
            },
          ],
          as: "rankDetails",
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
          rank: {
            $arrayElemAt: [
              "$rankDetails.rank",
              {
                $indexOfArray: [
                  "$rankDetails.studentId",
                  new mongoose.Types.ObjectId(studentId),
                ],
              },
            ],
          },
          status: 1,
        },
      },
      {
        $sort: { score: -1 },
      },
    ]);    
} catch (error) {
        console.log("error", error);
        return null;
    } 
}

module.exports = {findResultByExamAndStudent, createResult, getGivenExamsByStudentId, getAllExamGivenStudents, getResultsByStudentId};
