const Joi = require("joi");

function querySchemaValidation(req, res, next) {
  const querySchema = Joi.object({
    question: Joi.string().required(),
    knowledgebaseId: Joi.string()
      .required()
      .regex(/^[a-zA-Z\d-]+$/)
      .messages({
        "string.pattern.base":
          "knowledgebaseId can only contain alphanumeric and hiphen characters",
      }),
  });

  const { error, value } = querySchema.validate(req.body);

  if (error) {
    // on fail return comma separated errors
    console.log(error);
    res
      .status(400)
      .json({ code: "BadArgument", msg: error.details.map((x) => x.message) });
  } else {
    // on success replace req.body with validated value and trigger next middleware function
    req.body = value;
    next();
  }
}

module.exports = querySchemaValidation;
