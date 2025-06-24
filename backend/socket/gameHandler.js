const GameService = require('../services/gameService');

class GameHandler {
  constructor(io, socket) {
    this.io = io;
    this.socket = socket;
    this.setupEvents();
  }

  setupEvents() {
    this.socket.on('JOIN_GAME', this.handleJoinGame.bind(this));
    this.socket.on('BOWL', this.handleBowl.bind(this));
    this.socket.on('PLAY_SHOT', this.handleShot.bind(this));
  }

  async handleJoinGame({ gameId, token }) {
    try {
      // TODO: ऑथेंटिकेशन वेरिफाई करें
      this.socket.join(gameId);
      this.socket.emit('GAME_JOINED', { success: true });
    } catch (error) {
      this.socket.emit('ERROR', error.message);
    }
  }

  async handleBowl({ gameId, deliveryType }) {
    try {
      // गेंद फेंकने का लॉजिक
      const outcome = this.calculateDeliveryOutcome(deliveryType);
      
      this.io.to(gameId).emit('BALL_BOWLED', {
        deliveryType,
        speed: this.getRandomSpeed(),
        outcome
      });
      
      // 2 सेकंड बाद बल्लेबाज को मौका दें
      setTimeout(() => {
        this.io.to(gameId).emit('BATTER_TURN', { duration: 5000 });
      }, 2000);
    } catch (error) {
      this.socket.emit('ERROR', error.message);
    }
  }

  calculateDeliveryOutcome(type) {
    // सरल गेम लॉजिक
    const outcomes = ['dot', 'single', 'boundary', 'wicket'];
    return outcomes[Math.floor(Math.random() * outcomes.length)];
  }
}

module.exports = GameHandler;