const fs = require("fs");
const path = require("path");

const logger = (req, res, next) => {
  const { method, originalUrl } = req;
  const timestamp = new Date().toISOString();
  const start = Date.now();

  // Default to 'Guest' if not authenticated
  const user = req.user?.userId || "Guest";
  const role = req.user?.role || "none";

  res.on("finish", () => {
    const log = `[${timestamp}] ${method} ${originalUrl} - User: ${user}, Role: ${role} Response status: ${res.statusCode}\n`;

    fs.appendFile(
      path.join(__dirname, "..", "logs", "access.log"),
      log,
      (err) => {
        if (err) console.error("Logging failed:", err);
      }
    );

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
