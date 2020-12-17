const Joi = require("joi");

function createKBSchemaValidation(req, res, next) {
  const qnalistSchema = Joi.object().keys({
    answer: Joi.string().trim().required(),
    questions: Joi.array().items(Joi.string().trim()).min(1).required(),
  });

  const bodySchema = Joi.object({
    name: Joi.string().required().messages({
      "string.base": "name field must be of type string",
    }),
    urls: Joi.array().items(
      Joi.string().uri().messages({
        "string.base": "urls field must contain valid urls",
      })
    ),
    qnaList: Joi.array().items(qnalistSchema).min(1).required().messages({
      "object.base":
        "qnaList must contain list of objects containing questions, answer, metadata fields",
    }),
  });

  const { error, value } = bodySchema.validate(req.body);

  if (error) {
    // on fail return comma separated errors
    return res.status(400).json({
      code: "BadArgument",
      message: error.details.map((x) => x.message),
    });
  }

  // on success replace req.body with validated value and trigger next middleware function
  req.body = value;
  next();
}

module.exports = createKBSchemaValidation;
