require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const connectDB = require('./db');
const dishRoutes = require('./routes/dishes');
const startRealtimeSync = require('./realtime');

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dish-dashboard';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

async function main() {
  await connectDB(MONGO_URI);

  const app = express();
  app.use(cors({ origin: CLIENT_ORIGIN }));
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/dishes', dishRoutes);

  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: CLIENT_ORIGIN },
  });

  io.on('connection', (socket) => {
    console.log(`[socket] client connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`[socket] client disconnected: ${socket.id}`);
    });
  });

  startRealtimeSync(io);

  httpServer.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('[server] failed to start:', err);
  process.exit(1);
});
