const app = require("express")();
const bodyParser = require("body-parser");
const cors = require("cors");
const { prod_host } = require("./utils/enums");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { kbRouterWrapper } = require("./routes/knowledgebases");
const { operationRouterWrapper } = require("./routes/operations");
const { queryRouterWrapper } = require("./routes/query");
const { publishRouterWrapper } = require("./routes/publish");

if (!process.env[prod_host]) {
  throw new Error(
    "please set/export the following environment variable: " + prod_host
  );
}

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API for QnA Cognitive service ",
      version: "1.0.0",
      description:
        "This is API Document for a cognitive service that creates a knowledgebase of QnA(Question and Answer) pairs, publish them into a production index and query them for Answers. These API's help you create a Knowledgebase, get the details of it, monitor the status of operation of the request for creation of Knowledgebase, publish the knowledgebase into a production index, Query the knowledgebase and retrieve answers",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "Akhil Chundarathil",
        email: "achundar@uncc.edu",
      },
    },
    servers: [
      {
        url: `http://${process.env[prod_host]}:8080/api/`,
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);

const authenticated_result = require("./utils/authenticate")();

const kbRouter = kbRouterWrapper(authenticated_result);
const operationRouter = operationRouterWrapper(authenticated_result);
const queryRouter = queryRouterWrapper(authenticated_result);
const publishRouter = publishRouterWrapper(authenticated_result);

app.use(bodyParser.json());
app.use(cors());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use("/api/knowledgebases", kbRouter);
app.use("/api/operations", operationRouter);
app.use("/api/query", queryRouter);
app.use("/api/publish", publishRouter);

app.get("*", (req, res) => {
  res.send("Welcome !!");
});

app.listen(8080, () => {
  console.log("listening on port 8080");
});
