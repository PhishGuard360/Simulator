const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files (HTML, images, etc.)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname , 'public','index.html'));
  });

// Function to check if userId is unique
function isUniqueId(userId, callback) {
    fs.readFile('user_logs.txt', 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            console.error('Error reading log file:', err);
            return callback(false); // Assume not unique if an error occurs
        }
        const isUnique = !data || !data.includes(`User ID: ${userId},`);
        callback(isUnique);
    });
}

// Endpoint to log data
app.post('/log', (req, res) => {
    const { userId, timestamp } = req.body;

    if (!userId || !timestamp) {
        return res.status(400).json({ error: 'Invalid request payload' });
    }

    isUniqueId(userId, (isUnique) => {
        if (isUnique) {
            const logEntry = `User ID: ${userId}, Timestamp: ${timestamp}\n`;
            fs.appendFile('user_logs.txt', logEntry, (err) => {
                if (err) {
                    console.error('Error writing to log file:', err);
                    return res.status(500).json({ error: 'Failed to log data' });
                }
                console.log(`Logged unique User ID: ${userId}, Timestamp: ${timestamp}`);
                return res.status(200).json({ message: 'Data logged successfully' });
            });
        } else {
            console.log(`Duplicate User ID: ${userId} was not logged.`);
            return res.status(200).json({ message: 'Duplicate User ID. No logging occurred.' });
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
