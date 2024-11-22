const Joi = require("joi");

const updateProfileSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
}).or("name", "email", "password");

module.exports = {
  updateProfileSchema,
};
