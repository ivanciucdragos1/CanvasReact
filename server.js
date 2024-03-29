const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

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

app.use(cors({ origin: 'http://localhost:3001' }));

wss.on('connection', (ws) => {
    // Send current pixels to the newly connected client
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

    // Handle messages from clients
    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.action === 'placePixel' && data.userId && data.x !== undefined && data.y !== undefined) {
            // Deduct an available pixel before placing a new pixel
            pool.query(
                'UPDATE user_pixels SET available_pixels = GREATEST(0, available_pixels - 1) WHERE user_id = ?',
                [data.userId],
                (error) => {
                    if (error) {
                        console.error('Error updating available pixels:', error);
                        return;
                    }

                    console.log(`Deducted 1 pixel from user ${data.userId}`);
                    sendPixelCountUpdate(data.userId);

                    // Insert new pixel or update existing pixel
                    pool.query(
                        'INSERT INTO pixels (x_coordinate, y_coordinate, color, user_id, timestamp) VALUES (?, ?, ?, ?, NOW()) ' +
                        'ON DUPLICATE KEY UPDATE color = VALUES(color), user_id = VALUES(user_id), timestamp = NOW()',
                        [data.x, data.y, data.color, data.userId],
                        (error) => {
                            if (error) {
                                console.error('Error inserting or updating pixel data:', error);
                            } else {
                                console.log(`Pixel placed or updated at (${data.x}, ${data.y}) by user ${data.userId}`);
                                // Broadcast the pixel placement to all connected clients
                                wss.clients.forEach(client => {
                                    if (client.readyState === WebSocket.OPEN) {
                                        client.send(JSON.stringify({
                                            x: data.x,
                                            y: data.y,
                                            color: data.color,
                                            userId: data.userId,
                                            timestamp: new Date().toISOString() // Assuming immediate update
                                        }));
                                    }
                                });
                            }
                        }
                    );
                }
            );
        }
    });
});



const sendPixelCountUpdate = (userId) => {
    pool.query('SELECT available_pixels FROM user_pixels WHERE user_id = ?', [userId], (error, results) => {
        if (error || results.length === 0) {
            console.error('Error fetching available pixels:', error);
            return;
        }

        const availablePixels = results[0].available_pixels;

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ action: 'updatePixelCount', userId, availablePixels }));
            }
        });
    });
};

app.get('/top-burners', (req, res) => {
    pool.query(
        'SELECT user_id, SUM(amount_burned) AS total_burned FROM burn_transactions GROUP BY user_id ORDER BY total_burned DESC LIMIT 10',
        (error, results) => {
            if (error) {
                console.error('Error fetching top burners:', error);
                return res.status(500).json({ error: 'Database query failed' });
            }
            res.json(results);
        }
    );
});

app.get('/user-pixels/:userId', (req, res) => {
    const { userId } = req.params;
    pool.query(
        'SELECT available_pixels FROM user_pixels WHERE user_id = ?',
        [userId],
        (error, results) => {
            if (error) {
                console.error('Error fetching user pixels:', error);
                return res.status(500).json({ error: 'Database query failed' });
            }
            res.json(results[0] || { available_pixels: 0 });
        }
    );
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
