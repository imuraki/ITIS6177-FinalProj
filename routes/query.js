const router = require("express").Router();
const _ = require("lodash");
const querySchemaValidation = require("../middlewares/queryValidator");
const { runtime_endpoint_var } = require("../utils/enums");
const msRest = require("@azure/ms-rest-js");
const qnamaker_runtime = require("@azure/cognitiveservices-qnamaker-runtime");

const queryRouterWrapper = ({ qnaMakerClient }) => {
  /**
   * @swagger
   * /query:
   *   post:
   *     summary: queries the created Knowledgebase
   *     description: This API queries the knowledgebase with the given question. Kindly Publish the knowledgebase before querying.
   *     tags: [Query]
   *     requestBody:
   *       description: Query Model
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/querySchema'
   *     responses:
   *       202:
   *         description: Successful execution of the query
   *       500:
   *         description: Internal Server Error
   *
   */

  router.post("/", querySchemaValidation, async (req, res) => {
    try {
      const runtimeKeysClient = await qnaMakerClient.endpointKeys;
      const results = await runtimeKeysClient.getKeys();

      if (!results._response.status.toString().startsWith("2")) {
        return res.status(500).json({ error: "Internal server error" });
      }

      const queryRutimeCredentials = new msRest.ApiKeyCredentials({
        inHeader: {
          Authorization: "EndpointKey " + results.primaryEndpointKey,
        },
      });
      const runtimeClient = new qnamaker_runtime.QnAMakerRuntimeClient(
        queryRutimeCredentials,
        process.env[runtime_endpoint_var]
      );
      const requestQuery = await runtimeClient.runtime.generateAnswer(
        req.body.knowledgebaseId,
        _.pick(req.body, ["question", "top", "strictFilters"])
      );

      return res.json(
        requestQuery.answers.map((obj) =>
          _.pick(obj, ["questions", "answer", "score", "metadata"])
        )
      );
    } catch (err) {
      console.log(err);
      if (
        err.statusCode == 400 &&
        err.body.error.code === "AzureSearchBadState"
      )
        return res.status(404).json({
          code: "BadArgument",
          message: "Publish the knowledgebase before querying",
        });

      if (err.statusCode == 400 && err.body.error.code === "BadArgument")
        return res.status(400).json({
          code: "BadArgument",
          message: "Knowledgebase with given Id doesnt exists",
        });

      return res.status(err.statusCode).json(err.body.error);
    }
  });

  return router;
};

module.exports = { queryRouterWrapper };
