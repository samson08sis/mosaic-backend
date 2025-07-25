// COMMENTED FOR PRODUCTION
// const fs = require("fs");
const path = require("path");

// COMMENTED FOR PRODUCTION
// const setupLogFile = require("../utils/setup");

const logger = (req, res, next) => {
  // COMMENTED FOR PRODUCTION
  // setupLogFile();

  const { method, originalUrl } = req;
  const timestamp = new Date().toISOString();
  const start = Date.now();

  const user = req.query.user?.userId || "Guest";
  const role = req.query.user?.role || "none";

  res.on("finish", () => {
    const log = `[${timestamp}] ${method} ${originalUrl} - User: ${user}, Role: ${role} Response status: ${res.statusCode}\n`;

    // COMMENTED FOR PRODUCTION
    // fs.appendFile(
    //   path.join(__dirname, "..", "logs", "access.log"),
    //   log,
    //   (err) => {
    //     if (err) console.error("Logging failed:", err);
    //   }
    // );

    console.table([
      {
        Timestamp: new Date().toISOString(),
        Method: method,
        URL: originalUrl,
        User: user,
        Role: role,
        Status: res.statusCode,
        Duration: `${Date.now() - start}ms`,
      },
    ]);
  });

  next();
};

module.exports = logger;
