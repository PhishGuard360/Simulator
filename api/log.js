const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
    if (req.method === 'POST') {
        const { userId, timestamp } = req.body;

        if (!userId || !timestamp) {
            return res.status(400).json({ error: 'Invalid request payload' });
        }

        const logFilePath = path.join(process.cwd(), 'user_logs.txt');

        // Read the log file to check for duplicate user IDs
        fs.readFile(logFilePath, 'utf8', (err, data) => {
            if (err && err.code !== 'ENOENT') {
                console.error('Error reading log file:', err);
                return res.status(500).json({ error: 'Failed to log data' });
            }

            const isUnique = !data || !data.includes(`User ID: ${userId},`);
            if (isUnique) {
                const logEntry = `User ID: ${userId}, Timestamp: ${timestamp}\n`;
                fs.appendFile(logFilePath, logEntry, (err) => {
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
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
