const app = require("./app");
// const serverless = require("serverless-http");

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔁 Server running on http://localhost:${PORT}`);
});

// // Use serverless-http to handle the Express app
// module.exports.handler = serverless(app);
