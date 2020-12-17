const router = require("express").Router();
const createKBSchemaValidation = require("../middlewares/createKBValidator");
const idValidation = require("../middlewares/idValidator");
const _ = require("lodash");
const Joi = require("joi");

const kbRouterWrapper = ({ knowledgeBaseClient }) => {
  /**
   * @swagger
   *
   * components:
   *   schemas:
   *     Qna:
   *       type: object
   *       summary: QnA object containing list of questions and answers
   *       required:
   *        - answer
   *        - questions
   *       properties:
   *         answer:
   *           type: string
   *         questions:
   *           type: array
   *           items:
   *             type: string
   *
   *
   *     createKBBody:
   *       type: object
   *       required:
   *        - name
   *        - qnaList
   *       properties:
   *         name:
   *           type: string
   *           summary: Name of the knowledgebase
   *         qnaList:
   *           type: array
   *           summary: List of QnA objects containing list of questions and answers
   *           items:
   *             $ref: '#/components/schemas/Qna'
   *         urls:
   *           type: array
   *           summary: The list of urls containing FAQ Manuals etc, used for extracting QnA Pairs
   *           items:
   *             type: string
   *       example:
   *         name: Knowledgebase1
   *         qnaList:
   *           - answer: "Hello, How are you"
   *             questions: ["Hey", "Hi", "Hello"]
   *         urls: [ "https://docs.microsoft.com/en-in/azure/cognitive-services/qnamaker/faqs"]
   *
   *     querySchema:
   *       type: object
   *       required:
   *        - question
   *        - knowledgebaseId
   *       properties:
   *         question:
   *           type: string
   *           summary: The question to be queried for
   *         knowledgebaseId:
   *           type: string
   *           pattern: '^[a-zA-Z\d-]+$'
   *           summary: Upon this knowledgebase, the question is queried for
   *       example:
   *         question: "Hi"
   *         knowledgebaseId: "27b5e7df-b85e-48ce-b979-788787a79faa"
   */

  /**
   * @swagger
   * /knowledgebases:
   *     get:
   *       summary: Return all knowledgebases
   *       tags: [KnowledgeBase]
   *       produces:
   *             - application/json
   *       responses:
   *           200:
   *               description: response containing list of knowledgebases.
   *           500:
   *               description: Internal Server Error
   */
  router.get("/", async (req, res) => {
    try {
      const result = await knowledgeBaseClient.listAll();
      return res.json({
        knowledgebases: result.knowledgebases.map((obj) =>
          _.pick(obj, ["id", "name", "createdTimestamp"])
        ),
      });
    } catch (err) {
      return res
        .status(err.statusCode)
        .json(_.pick(err.body.error, ["code", "message"]));
    }
  });

  /**
   * @swagger
   * /knowledgebases/{id}:
   *     get:
   *       summary: Return the information of a particular knowledgebase
   *       tags: [KnowledgeBase]
   *       parameters:
   *         - in: path
   *           name: id
   *           schema:
   *             type: string
   *             pattern: '^[a-zA-Z\d-]+$'
   *           required: true
   *           description: This API returns the detailed information of a particular knowledgebase given its id(contains only alphanumeric and hiphen characters)
   *       produces:
   *             - application/json
   *       responses:
   *           200:
   *               description: Information of a particular knowledgebase.
   *               schema:
   *                 type: array
   *                 items:
   *                   type: string
   *           404:
   *               description: Not found
   *           500:
   *               description: Internal Server Error
   */

  router.get("/:id", idValidation, async (req, res) => {
    try {
      const result = await knowledgeBaseClient.getDetails(req.params.id);
      return res.json({
        knowledgebase: _.pick(result, ["id", "name", "createdTimestamp"]),
      });
    } catch (err) {
      console.log(err);
      if (err.statusCode == 400)
        return res
          .status(404)
          .json(_.pick(err.body.error, ["code", "message"]));
      return res.status(500).json({ msg: "Internal server error" });
    }
  });

  /**
   * @swagger
   * /knowledgebases:
   *   post:
   *     summary: Creates a new KnowledgeBase
   *     description: |
   *        This API creates a new Knowledgebase of QnA pairs.
   *        This request will return an operation id using which we can poll
   *        and monitor the status of the creation of Knowledgebase.
   *     tags: [KnowledgeBase]
   *     requestBody:
   *       description: The schema here follows theb createKBBody schema
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/createKBBody'
   *     responses:
   *       202:
   *         description: Operation Initiated to create knowledgebase
   */

  router.post("/", createKBSchemaValidation, async (req, res) => {
    try {
      const results = await knowledgeBaseClient.create(req.body);
      return res
        .status(202)
        .json(
          _.pick(results, [
            "operationState",
            "createdTimestamp",
            "resourceLocation",
            "operationId",
          ])
        );
    } catch (err) {
      return res
        .status(err.statusCode)
        .json(_.pick(err.body.error, ["code", "message"]));
    }
  });

  /**
   * @swagger
   * /knowledgebases/{id}:
   *     delete:
   *       summary: Deletes the knowledgebase
   *       tags: [KnowledgeBase]
   *       parameters:
   *         - in: path
   *           name: id
   *           schema:
   *             type: string
   *             pattern: '^[a-zA-Z\d-]+$'
   *           required: true
   *           description: This API deletes the knowledgebase given its id(contains only alphanumeric and hiphen characters)
   *       produces:
   *             - application/json
   *       responses:
   *           200:
   *               description: success.
   *           404:
   *               description: Not found
   *           500:
   *               description: Internal Server Error
   */

  router.delete("/:id", idValidation, async (req, res) => {
    try {
      const results = await knowledgeBaseClient.deleteMethod(req.params.id);
      return res.json({ message: "Successfully deleted the knowledgebase" });
    } catch (err) {
      return res
        .status(err.statusCode)
        .json(_.pick(err.body.error, ["code", "message"]));
    }
  });

  return router;
};

module.exports = {
  kbRouterWrapper,
};
