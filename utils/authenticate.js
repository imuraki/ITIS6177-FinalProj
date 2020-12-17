const {
  key_var,
  endpoint_var,
  runtime_endpoint_var,
  prod_host,
} = require("./enums");

const msRest = require("@azure/ms-rest-js");
const qnamaker = require("@azure/cognitiveservices-qnamaker");

const authenticate = () => {
  if (!process.env[key_var]) {
    throw new Error(
      "please set/export the following environment variable: " + key_var
    );
  }

  if (!process.env[endpoint_var]) {
    throw new Error(
      "please set/export the following environment variable: " + endpoint_var
    );
  }

  if (!process.env[runtime_endpoint_var]) {
    throw new Error(
      "please set/export the following environment variable: " +
        runtime_endpoint_var
    );
  }

  if (!process.env[prod_host]) {
    throw new Error(
      "please set/export the following environment variable: " + prod_host
    );
  }

  const creds = new msRest.ApiKeyCredentials({
    inHeader: { "Ocp-Apim-Subscription-Key": process.env[key_var] },
  });
  const qnaMakerClient = new qnamaker.QnAMakerClient(
    creds,
    process.env[endpoint_var]
  );
  const knowledgeBaseClient = new qnamaker.Knowledgebase(qnaMakerClient);

  return { qnaMakerClient, knowledgeBaseClient };
};

module.exports = authenticate;
