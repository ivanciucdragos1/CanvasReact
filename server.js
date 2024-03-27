const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: "root",
    password: "password",
    database: 'rplace_clone'
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const cors = require('cors');

// Use it before all route definitions
app.use(cors({
  origin: 'http://localhost:3001' // or you can use '*', to allow all origins
}));

wss.on('connection', (ws) => {
    pool.query('SELECT * FROM pixels', (error, results) => {
        if (error) {
            console.error('Error fetching pixels:', error);
            return;
        }

        results.forEach((pixel) => {
            ws.send(JSON.stringify({
                x: pixel.x_coordinate,
                y: pixel.y_coordinate,
                color: pixel.color,
                userId: pixel.user_id,
                timestamp: pixel.timestamp
            }));
        });
    });

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.action === 'addPixels' && data.userId) {
            // Assuming data.pixelsToAdd contains the number of pixels to add
            pool.query('UPDATE user_pixels SET available_pixels = available_pixels + ? WHERE user_id = ?', [data.pixelsToAdd, data.userId], (error) => {
                if (error) {
                    console.error('Error adding available pixels:', error);
                    return;
                }
                console.log(`Added ${data.pixelsToAdd} pixels to user ${data.userId}`);
                sendPixelCountUpdate(ws, data.userId);
            });
        }
        else if (data.x !== undefined && data.y !== undefined && data.userId) {
            pool.query('SELECT available_pixels FROM user_pixels WHERE user_id = ?', [data.userId], (error, results) => {
                if (error || results.length === 0) {
                    console.error('Error checking available pixels:', error);
                    return;
                }

                if (results[0].available_pixels > 0) {
                    const query = `INSERT INTO pixels (x_coordinate, y_coordinate, color, user_id) 
                                   VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE color = VALUES(color), 
                                   user_id = VALUES(user_id), timestamp = CURRENT_TIMESTAMP`;
                    pool.query(query, [data.x, data.y, data.color, data.userId], (error) => {
                        if (error) {
                            console.error('Error updating pixel:', error);
                            return;
                        }
                        pool.query('UPDATE user_pixels SET available_pixels = available_pixels - 1, placed_pixels = placed_pixels + 1 WHERE user_id = ?', [data.userId], (error) => {
                            if (error) {
                                console.error('Error updating pixel counts for user:', error);
                                return;
                            }
                            sendPixelCountUpdate(ws, data.userId);
                        });
                    });
                } else {
                    ws.send(JSON.stringify({ error: 'Not enough available pixels.' }));
                }
            });
        }
    });
});


// Endpoint to update pixel count
app.post('/update-pixels', (req, res) => {
    const { userPublicKey, pixelsToAdd } = req.body;

    pool.query('UPDATE user_pixels SET available_pixels = available_pixels + ? WHERE user_id = ?', [pixelsToAdd, userPublicKey], (error, results) => {
        if (error) {
            console.error('Error updating pixel count:', error);
            return res.status(500).json({ error: 'Database update failed' });
        }
        res.json({ success: true });
    });
});

function sendPixelCountUpdate(ws, userId) {
    pool.query('SELECT available_pixels, placed_pixels FROM user_pixels WHERE user_id = ?', [userId], (error, results) => {
        if (error || results.length === 0) {
            console.error('Error sending pixel count update:', error);
            return;
        }
        ws.send(JSON.stringify({
            action: 'updatePixelCount',
            availablePixels: results[0].available_pixels,
            placedPixels: results[0].placed_pixels
        }));
    });
}

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
