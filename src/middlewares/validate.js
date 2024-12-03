const { statusCode, responseMessage } = require("../utils/constant");
const { response } = require("../utils/common");

const validate = (schema) => (req, res, next) => {
  try {
    const { error } = schema.validate(
      { ...req.body, ...req.query, ...req.params },
      { abortEarly: false, stripUnknown: true }
    );

    if (error) {
      return response(
        false,
        res,
        statusCode.BAD_REQUEST,
        error.details[0].message
      );
    }

    next();
  } catch (err) {
    console.error("Validation error:", err);
    return response(
      false,
      res,
      statusCode.INTERNAL_SERVER_ERROR,
      responseMessage.ERROR_DURING_VALIDATION
    );
  }
};

module.exports = validate;
