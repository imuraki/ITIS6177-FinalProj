const router = require("express").Router();
const _ = require("lodash");
const idValidation = require("../middlewares/idValidator");

const publishRouterWrapper = ({ knowledgeBaseClient }) => {
  /**
   * @swagger
   * /publish/{id}:
   *   post:
   *     summary: publishes the Knowledgebase
   *     description: This API publishes the knowledgebase with given id. Only two knowledgebases can be published. This request might take a while to process
   *     tags: [Publish]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *           pattern: '^[a-zA-Z\d-]+$'
   *         required: true
   *         description: Id of the Knowledgebase
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: KB Quota exceeded
   *       500:
   *         description: Internal server error
   *
   */
  router.post("/:id", idValidation, async (req, res) => {
    try {
      const results = await knowledgeBaseClient.publish(req.params.id);

      if (!results._response.status.toString().startsWith("2"))
        return res.status(500).json({ message: "Publish failed" });

      return res.json({ message: "Successfully published the knowledgebase" });
    } catch (err) {
      if (
        err.statusCode == 400 &&
        err.body.error.innerError.code === "IndexQuotaExceeded"
      )
        return res.status(400).json({
          code: "KB Quota exceeded",
          message:
            "Kindly delete any of the existing Knowledgebases. Only two can be published",
        });
      return res
        .status(err.statusCode)
        .json(_.pick(err.body.error, ["code", "message"]));
    }
  });

  return router;
};

module.exports = {
  publishRouterWrapper,
};
