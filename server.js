const app = require("./app");
const serverless = require("serverless-http");

// Use serverless-http to handle the Express app
module.exports.handler = serverless(app);
