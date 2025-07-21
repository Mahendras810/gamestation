const http = require('http');
const { Server } = require('socket.io');
const app = require('./app'); // ✅ import the configured app here
const db = require('./backend/config/db');

const server = http.createServer(app); // ✅ use that app here
const io = new Server(server);

// Sync DB
db.sequelize.sync({ force: false, alter: false })
  .then(() => console.log("✅ DB Synced"))
  .catch((err) => console.error("❌ Sequelize sync error:", err));

// Load routes (already configured inside app.js)
// Load socket handlers
const loadSocketHandlers = require('./backend/socket/loader');
io.on('connection', (socket) => loadSocketHandlers(io, socket));

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
