const Joi = require("joi");

function idValidation(req, res, next) {
  const IdSchema = Joi.object({
    id: Joi.string()
      .required()
      .regex(/^[a-zA-Z\d-]+$/)
      .messages({
        "string.pattern.base":
          "id can only contain alphanumeric and hiphen characters",
      }),
  });

  const { error, value } = IdSchema.validate(req.params);

  if (error)
    return res.status(400).json({
      code: "BadArgument",
      message: error.details.map((x) => x.message),
    });

  req.params = value;
  next();
}

module.exports = idValidation;
