const fs = require('fs');
const path = require('path');

// Log file path
const logFilePath = path.join(__dirname, '../app.logs');

// Ensure log file exists
if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, '');
}

const logger = {
    log: (message) => {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}\n`;

        // Write to file
        fs.appendFile(logFilePath, logMessage, (err) => {
            if (err) console.error('Failed to write to log file:', err);
        });

        // Also print to console
        console.log(logMessage.trim());
    },

    error: (message, error) => {
        const timestamp = new Date().toISOString();
        const errorMessage = `[${timestamp}] [ERROR] ${message} ${error ? JSON.stringify(error.message || error) : ''}\n`;

        fs.appendFile(logFilePath, errorMessage, (err) => {
            if (err) console.error('Failed to write error to log file:', err);
        });

        console.error(errorMessage.trim());
    }
};

module.exports = logger;
