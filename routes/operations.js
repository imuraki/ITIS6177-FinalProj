const router = require("express").Router();
const _ = require("lodash");
const idValidation = require("../middlewares/idValidator");
const { prod_host } = require("../utils/enums");

const operationRouterWrapper = ({ qnaMakerClient }) => {
  /**
   * @swagger
   * /operations/{id}:
   *     get:
   *       summary: Return the status of a particular operation initiated in the server
   *       tags: [Operations]
   *       parameters:
   *         - in: path
   *           name: id
   *           schema:
   *             type: string
   *             pattern: '^[a-zA-Z\d-]+$'
   *           required: true
   *           description: unique ID of an operation that contains only alphanumeric and hiphen characters
   *       produces:
   *             - application/json
   *       responses:
   *           200:
   *               description: Success.
   *           404:
   *               description: Not found
   *           500:
   *               description: Internal Server Error
   */

  router.get("/:id", idValidation, async (req, res) => {
    try {
      const operationResult = await qnaMakerClient.operations.getDetails(
        req.params.id
      );
      const resultObj = _.pick(operationResult, [
        "operationState",
        "createdTimestamp",
        "resourceLocation",
        "operationId",
        "errorResponse",
      ]);
      return res.json({
        ...resultObj,
        ...(resultObj.resourceLocation && {
          resourceLocation: `http:${process.env[prod_host]}:3000/api${resultObj.resourceLocation}`,
          ...(resultObj.resourceLocation && {
            knowledgebaseId: resultObj.resourceLocation.replace(
              "/knowledgebases/",
              ""
            ),
          }),
        }),
      });
    } catch (err) {
      return res
        .status(err.statusCode)
        .json(_.pick(err.body.error, ["code", "message"]));
    }
  });

  return router;
};

module.exports = { operationRouterWrapper };
