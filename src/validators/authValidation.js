const Joi = require("joi");

const signupSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("teacher", "student").required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const emailVerificationSchema = Joi.object({
  email: Joi.string().email().required(),
});

module.exports = {
  signupSchema,
  loginSchema,
  emailVerificationSchema,
};
