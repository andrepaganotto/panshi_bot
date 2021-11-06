import WebSocket from 'ws';
import jwt from 'jsonwebtoken';
import { isBlacklisted } from './controllers/authController.js';

function onMessage(data) {
    console.log(`onMessage: ${data}`);
}

function onError(err) {
    console.error(`onError: ${err.message}`);
}

function onConnection(ws, req) {
    ws.on('message', onMessage);
    ws.on('error', onError);
    console.log('onConnection');
}

function corsValidation(origin) {
    return process.env.CORS_ORIGIN.startsWith(origin);
}

function verifyClient(info, callback) {
    if (!corsValidation(info.origin)) return callback(false, 401);

    const token = info.req.url.split('token=')[1];
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded && !isBlacklisted(token)) {
                return callback(true);
            }
        }
        catch (err) {
            console.error(token, err);
        }
    }

    return callback(false, 401);
}

function broadcast(message) {
    if (!this.clients) return;
    this.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

export default (server) => {
    const wss = new WebSocket.Server({ server, verifyClient })

    wss.on('connection', onConnection);
    wss.broadcast = broadcast;
    console.log('Running WebSocket server');

    return wss;
}