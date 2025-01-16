// logs/errorLogs.js

const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, 'errorLogs.txt'); // Path to the log file

const logErrorToFile = (error, req) => {
  // const logMessage = `${new Date().toISOString()} - Error: ${error.message}\nStack: ${error.stack}\n\n`;
  const logMessage = `
  ${new Date().toISOString()} - Error: ${error.message}
  Stack: ${error.stack}
  Request Method: ${req.method}
  Request URL: ${req.originalUrl}
  Headers: ${JSON.stringify(req.headers)}
  \n\n`;
  fs.appendFileSync(logFilePath, logMessage, { encoding: 'utf8' });
};

module.exports = logErrorToFile;
