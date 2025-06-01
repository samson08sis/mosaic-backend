const fs = require("fs");
const path = require("path");

const logger = (req, res, next) => {
  const { method, originalUrl } = req;
  const timestamp = new Date().toISOString();

  // Default to 'Guest' if not authenticated
  const user = req.user?.email || "Guest";
  const role = req.user?.role || "none";

  const log = `[${timestamp}] ${method} ${originalUrl} - User: ${user}, Role: ${role}\n`;

  fs.appendFile(
    path.join(__dirname, "..", "logs", "access.log"),
    log,
    (err) => {
      if (err) console.error("Logging failed:", err);
    }
  );

  console.log(log.trim());
  next();
};

module.exports = logger;
