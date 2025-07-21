// backend/socket/loader.js
const fs = require('fs');
const path = require('path');

function loadSocketHandlers(io, socket) {
  const handlersDir = path.join(__dirname, 'games');

  fs.readdirSync(handlersDir).forEach(file => {
    if (file.endsWith('SocketHandler.js')) {
      const HandlerClass = require(path.join(handlersDir, file));
      if (typeof HandlerClass === 'function') {
        new HandlerClass(io, socket); // Instantiate and bind events
        console.log(`✅ Loaded: ${file}`);
      }
    }
  });
}

module.exports = loadSocketHandlers;
