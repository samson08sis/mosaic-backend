const fs = require("fs");
const path = require("path");

const setupLogFile = () => {
  const logDir = path.join(__dirname, "..", "logs");
  const logFile = path.join(logDir, "access.log");

  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
      console.log("Created logs directory");
    }

    if (!fs.existsSync(logFile)) {
      fs.writeFileSync(logFile, "");
      console.log("Created access.log file");
      console.log("Logging system ready");
    }
  } catch (err) {
    console.error("Setup failed:", err);
    process.exit(1);
  }
};

module.exports = setupLogFile;
