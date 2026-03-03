import { WebSocket, WebSocketServer } from "ws";
import { isBadBot, wsLimiter } from "../protection.js";

const matchSubscribers = new Map();

function subscribe(matchId, socket) {
  if (!matchSubscribers.has(matchId)) {
    matchSubscribers.set(matchId, new Set());
  }
  matchSubscribers.get(matchId).add(socket);
}

function unsubscribe(matchId, socket) {
  const subscribers = matchSubscribers.get(matchId);

  if (!subscribers) return;

  subscribers.delete(socket);

  if (subscribers.size === 0) {
    subscribers.delete(matchId);
  }
}

function cleanUpSubscribers(socket) {
  for (const matchId of socket.subscriptions || []) {
    unsubscribe(matchId, socket);
  }
}

function sendJson(socket, payload) {
  if (socket.readyState !== WebSocket.OPEN) return;

  socket.send(JSON.stringify(payload));
}

function broadcastToAll(wss, payload) {
  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) continue;

    client.send(JSON.stringify(payload));
  }
}

function broadcastToMatch(matchId, payload) {
  const subscribers = matchSubscribers.get(matchId);
  if (!subscribers || subscribers.size === 0) return;

  subscribers.forEach((socket) => {
    sendJson(socket, payload);
  });
}

function handleMessage(socket, data) {
  let message;

  try {
    const raw = Array.isArray(data)
      ? Buffer.concat(data).toString("utf8")  // array de Buffers
      : Buffer.from(data).toString("utf8");   // Buffer ou ArrayBuffer

    message = JSON.parse(raw);
  } catch (error) {
    sendJson(socket, { type: "error", message: "Invalid JSON" });
  }

  if (message?.type === "subscribe" && Number.isInteger(message.matchId) ) {
    subscribe(message.matchId, socket);
    socket.subscriptions.add(message.matchId);
    sendJson(socket, { type: "subscribed", matchId: message.matchId });
    return
  }

  if(message?.type === "unsubscribe" && Number.isInteger(message.matchId) ) {
    unsubscribe(message.matchId, socket);
    socket.subscriptions.delete(message.matchId);
    sendJson(socket, { type: "unsubscribed", matchId: message.matchId });
    return
  }
}

export function attachWebSocketServer(server) {
  const wss = new WebSocketServer({ 
    noServer: true,
    path: "/ws",
    maxPayload: 1024 * 1024, // 1 MB
  });

  server.on('upgrade', async (req, socket, head) => {
      const ip = req.socket.remoteAddress;

      try {
          if (isBadBot(req)) {
              socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
              socket.destroy();
              return;
          }

          await wsLimiter.consume(ip);

          wss.handleUpgrade(req, socket, head, (ws) => {
              wss.emit('connection', ws, req);
          });

      } catch (e) {
          wss.handleUpgrade(req, socket, head, (ws) => {
              ws.close(1008, 'Rate limit exceeded. Try again later.');
          });
      }
  });


  wss.on("connection", (socket) => {
    socket.isAlive = true;
    socket.on("pong", () => { socket.isAlive = true });

    sendJson(socket, { type: "welcome" });

    socket.subscriptions = new Set();

    socket.on("message", (data) => {
      handleMessage(socket, data);
    });

    socket.on("error", () => {
      socket.terminate();
    });
    
    socket.on("close", () => {
      cleanUpSubscribers(socket);
    });
    
    socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();

      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => { clearInterval(interval) });

  function broadcastMatchCreated(match) {
    broadcastToAll(wss, { type: "match_created", data: match });
  }

  function broadcastCommentary(matchId, commentary) {
    broadcastToMatch(matchId, { type: "commentary", data: commentary });
  }

  return { broadcastMatchCreated, broadcastCommentary };
}
