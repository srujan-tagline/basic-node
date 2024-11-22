const Joi = require("joi");

const createExamSchema = Joi.object({
  subjectName: Joi.string().required(),
  questions: Joi.array()
    .items(
      Joi.object({
        questionText: Joi.string().required(),
        options: Joi.array().items(Joi.string().required()).min(2).required(),
        correctAnswer: Joi.string().required(),
      })
    )
    .min(1)
    .required(),
});

const updateExamSchema = Joi.object({
  subjectName: Joi.string().optional(),
  questions: Joi.array()
    .items(
      Joi.object({
        questionText: Joi.string().optional(),
        options: Joi.array().items(Joi.string().optional()).min(2).optional(),
        correctAnswer: Joi.string().optional(),
      })
    )
    .optional(),
});

module.exports = { createExamSchema, updateExamSchema };
