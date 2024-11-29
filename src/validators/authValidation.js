const Joi = require("joi");

const signupSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string()
    .custom((value, helpers) => {
      // Check basic email format
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) {
        return helpers.message("Invalid email format.");
      }

      // Extract the domain and TLDs
      const domainParts = value.split(".");
      const tld = domainParts.slice(-1)[0];
      const allowedTLDs = [ "com", "net", "org", "edu", "gov", "in", "io", "ai", "us", "uk", "co" ];

      // Check if the last part is a valid TLD
      if (!allowedTLDs.includes(tld)) {
        return helpers.message(
          `Invalid TLD: ${tld}. Allowed TLDs are ${allowedTLDs.join(", ")}.`
        );
      }

      // Ensure there are no extra TLDs in the domain
      const invalidTLDs = domainParts
        .slice(-2, -1)
        .filter((part) => allowedTLDs.includes(part));
      if (invalidTLDs.length > 0) {
        return helpers.message("Only one valid TLD is allowed in the email.");
      }

      return value; // Valid email
    })
    .required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("teacher", "student").required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const changePasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.string().required(),
});

const resetPasswordSchema = Joi.object({
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.string().required(),
});

const emailVerificationSchema = Joi.object({
  email: Joi.string().email().required(),
});

module.exports = {
  signupSchema,
  loginSchema,
  changePasswordSchema,
  resetPasswordSchema,
  emailVerificationSchema
};