const validate = (schema) => (req, res, next) => {
  try {
    const { error } = schema.validate(
      { ...req.body, ...req.query, ...req.params },
      { abortEarly: false, stripUnknown: true }
    );

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    next();
  } catch (err) {
    console.error("Validation error:", err);
    return res
      .status(500)
      .json({ message: "Internal Server Error during validation." });
  }
};

module.exports = validate;
