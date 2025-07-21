// backend/socket/games/cricketSocketHandler.js
const GameService = require('../../services/gameService');
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;


class CricketSocketHandler {
  constructor(io, socket) {
    this.io = io;
    this.socket = socket;
    this.currentGames = new Map();

    if (this.socket) {
      this.setupEvents();
    }
  }

  setupEvents() {
    this.socket.on('JOIN_GAME', this.handleJoinGame.bind(this));
    this.socket.on('BOWL', this.handleBowl.bind(this));
    this.socket.on('PLAY_SHOT', this.handleShot.bind(this));
    this.socket.on('disconnect', this.handleDisconnect.bind(this));
  }

  async handleJoinGame({ gameId, token }) {
    try {
      if (!token) throw new Error('Authentication required');
      const decoded = jwt.verify(token, secret);
      const user = await GameService.getUserById(decoded.userId);
      if (!user) throw new Error('User not found');

      this.socket.join(gameId);

      this.socket.emit('GAME_JOINED', {
        success: true,
        player: user.username,
        position: this.getPlayerCount(gameId)
      });

      this.io.to(gameId).emit('PLAYER_JOINED', {
        player: user.username,
        totalPlayers: this.getPlayerCount(gameId)
      });
    } catch (err) {
      this.socket.emit('ERROR', { message: err.message });
    }
  }


  async handleBowl({ gameId, deliveryType, token }) {
    try {
      if (!token) {
        return this.socket.emit('ERROR', { message: 'Login required to bowl' });
      }

      const decoded = jwt.verify(token, secret);

      // You can optionally validate userId here again
      // or fetch user using decoded.userId

      const outcome = this.calculateDeliveryOutcome(deliveryType);
      const ballData = {
        deliveryType,
        speed: this.getRandomSpeed(),
        outcome,
        timestamp: Date.now()
      };

      this.io.to(gameId).emit('BALL_BOWLED', ballData);

      setTimeout(() => {
        this.io.to(gameId).emit('BATTER_TURN', {
          duration: 5000,
          bowler: this.getCurrentBowler(gameId)
        });
      }, 2000);
    } catch (error) {
      this.socket.emit('ERROR', { message: error.message });
    }
  }


  handleShot({ gameId, shotType, timing }) {
    // Future: implement shot handling
  }

  getRandomSpeed() {
    return Math.floor(Math.random() * 40) + 120;
  }

  calculateDeliveryOutcome(type) {
    const outcomes = [
      { type: 'dot', probability: 0.3 },
      { type: 'single', probability: 0.4 },
      { type: 'boundary', probability: 0.2 },
      { type: 'wicket', probability: 0.1 }
    ];

    const total = outcomes.reduce((sum, o) => sum + o.probability, 0);
    const random = Math.random() * total;
    let current = 0;
    for (const o of outcomes) {
      current += o.probability;
      if (random <= current) return o.type;
    }
    return outcomes[0].type;
  }

  getPlayerCount(gameId) {
    return this.io.sockets.adapter.rooms.get(gameId)?.size || 0;
  }

  getCurrentBowler(gameId) {
    return 'Player1'; // Replace with real logic
  }

  handleDisconnect() {
    // Future: cleanup if needed
  }
}

module.exports = CricketSocketHandler;
