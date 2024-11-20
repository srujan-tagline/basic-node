// const Joi = require("joi");

// const submitExamSchema = Joi.object({
//   examId: Joi.string().required(),
//   studentId: Joi.string().required(),
//   answers: Joi.array()
//     .items(
//       Joi.object({
//         questionId: Joi.string().required(),
//         selectedOption: Joi.string().required(),
//       })
//     )
//     .min(1)
//     .required(),
//   score: Joi.number().required(),
// });

// module.exports = {submitExamSchema};

const Joi = require("joi");

const startExamSchema = Joi.object({
  subjectName: Joi.string().required(),
});

const submitExamSchema = Joi.object({
  examId: Joi.string().required(),
  answers: Joi.array()
    .items(
      Joi.object({
        questionId: Joi.string().required(),
        selectedOption: Joi.string().required(),
      })
    )
    .min(1)
    .required(),
});

module.exports = {startExamSchema, submitExamSchema};