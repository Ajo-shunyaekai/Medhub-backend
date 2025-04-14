const fs = require("fs");
const path = require("path");

const logFilePath = path.join(__dirname, "errorLogs.txt"); // Path to the log file

const logErrorToFile = (error, req, type = undefined) => {
  const logMessage = `
  ${new Date().toISOString()} - Error: ${error?.message || type}
  Stack: ${error?.stack || type}
  Request Method: ${req?.method || ""}
  Request URL: ${req?.originalUrl || ""}
  Headers: ${JSON.stringify(req?.headers || "")}
  \n\n`;
  fs.appendFileSync(logFilePath, logMessage, { encoding: "utf8" });
};

module.exports = logErrorToFile;
