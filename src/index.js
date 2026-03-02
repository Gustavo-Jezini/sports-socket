import express from 'express';
import http from 'http';
import helmet from 'helmet';
import { matchRouter } from './routes/matches.js';
import { attachWebSocketServer } from './ws/server.js'
import { securityMiddleware } from './protection.js';

const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || '0.0.0.0';

const app = express();
const server = http.createServer(app);
app.use(helmet());

// Middleware
app.use(express.json());

app.use(securityMiddleware());

app.use('/matches', matchRouter)
// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Sports Socket API! 🚀' });
});

const { broadcastMatchCreated } = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

// Start server
server.listen(PORT, HOST, () => {
  const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`Server is running on ${baseUrl}`);
  console.log(`WebSocket server is running on ws://${HOST}:${PORT}/ws`);
}).on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
