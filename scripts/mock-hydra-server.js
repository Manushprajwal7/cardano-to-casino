const express = require("express");
const http = require("http");
const WebSocket = require("ws");

// Create Express app
const app = express();
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Set();

// Handle WebSocket connections
wss.on("connection", (ws) => {
  console.log("New client connected to mock Hydra server");
  clients.add(ws);

  // Send initial status
  ws.send(
    JSON.stringify({
      type: "status",
      data: {
        state: "Open",
        uptime: Date.now(),
        participants: 1,
      },
    })
  );

  // Send periodic mock data
  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      // Random mock events
      const events = ["bet", "play", "settlement"];
      const event = events[Math.floor(Math.random() * events.length)];

      ws.send(
        JSON.stringify({
          type: event,
          timestamp: new Date().toISOString(),
          payload: {
            amount: `${Math.floor(Math.random() * 100)} ADA`,
            table: `T-${Math.floor(Math.random() * 10) + 1}`,
            player: `player-${Math.floor(Math.random() * 1000)}`,
          },
        })
      );
    }
  }, 1000);

  // Handle messages from client
  ws.on("message", (message) => {
    console.log("Received:", message.toString());
  });

  // Handle disconnect
  ws.on("close", () => {
    console.log("Client disconnected");
    clients.delete(ws);
    clearInterval(interval);
  });
});

// REST API endpoints
app.use(express.json());

// Root path - return server info
app.get("/", (req, res) => {
  res.json({
    name: "Mock Hydra Server",
    status: "running",
    port: process.env.PORT || 4000,
    uptime: process.uptime(),
    description: "Mock server for Cardano Casino Hydra integration development",
  });
});

// Health check
app.get("/status", (req, res) => {
  res.json({
    state: "Open",
    uptime: process.uptime(),
    participants: clients.size,
    version: "mock-1.0.0",
  });
});

// Submit transaction
app.post("/tx", (req, res) => {
  const txId =
    "tx_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  res.json({
    txId,
    status: "submitted",
  });
});

// Commit endpoint
app.post("/commit", (req, res) => {
  res.json({
    status: "committed",
    txHash: "tx_" + Date.now() + "_commit",
  });
});

// Contest endpoint
app.post("/contest", (req, res) => {
  res.json({
    status: "contested",
    contestationId: "contest_" + Date.now(),
  });
});

// Close endpoint
app.post("/close", (req, res) => {
  res.json({
    status: "closed",
    finalTxHash: "tx_" + Date.now() + "_final",
  });
});

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Mock Hydra server running on port ${PORT}`);
  console.log(`WebSocket server available at ws://localhost:${PORT}`);
  console.log(`REST API available at http://localhost:${PORT}`);
});
