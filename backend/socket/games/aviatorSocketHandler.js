// backend/socket/games/aviatorSocketHandler.js
const crypto = require('crypto');
const db = require('../../config/db');
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

class AviatorSocketHandler {
  static isStartingRound = false;

  constructor(io, socket) {
    this.io = io;
    this.socket = socket;
    this.activeBets = new Map();
    if (this.socket) this.setupListeners();
  }

  setupListeners() {
    this.socket.on('placeAviatorBet', this.handlePlaceBet.bind(this));
    this.socket.on('cashoutAviator', this.handleCashout.bind(this));
    this.socket.on('gameCrash', this.handleCrash.bind(this));
    this.socket.on('requestNewRound', () => AviatorSocketHandler.startInitialRound(this.io));
  }

  static async startInitialRound(io) {
    try {
      const handler = new AviatorSocketHandler(io, null);
      await handler.handleNewRound();
    } catch (err) {
      console.error('Failed to start new round:', err.message);
    }
  }

  calculateCrashPoint() {
    const e = 2 ** 32;
    const h = crypto.createHash('sha256').update(Date.now().toString()).digest('hex');
    const hDecimal = parseInt(h.substring(0, 8), 16);
    const crashPoint = (100 * e - hDecimal) / (e - hDecimal) / 100;
    return Math.max(1.10, crashPoint);
  }

  async handlePlaceBet(data) {
    try {
      const { userId, amount, gameId, token } = data;

      // ✅ 1. Check if user is authenticated
      if (!userId || !token) {
        return this.socket.emit('aviator:error', { message: 'Login required to place a bet' });
      }

      // ✅ 2. Fetch user + wallet
      const user = await db.User.findByPk(userId, {
        include: [{ model: db.Wallet, as: 'wallet' }]
      });

      if (!user) {
        return this.socket.emit('aviator:error', { message: 'User not found' });
      }

      if (!user.wallet) {
        return this.socket.emit('aviator:error', { message: 'Wallet not found' });
      }

      // ✅ 3. Validate bet amount
      if (isNaN(amount) || amount <= 0) {
        return this.socket.emit('aviator:error', { message: 'Invalid bet amount' });
      }

      if (user.wallet.balance < amount) {
        return this.socket.emit('aviator:error', { message: 'Insufficient wallet balance' });
      }

      // ✅ 4. Deduct balance and save
      user.wallet.balance -= amount;
      await user.wallet.save();

      // ✅ 5. Record bet
      const bet = await db.AviatorBet.create({
        userId,
        amount,
        gameId,
        username: user.username
      });

      this.activeBets.set(`${userId}-${gameId}`, bet);

      // ✅ 6. Emit updated bets to all
      const bets = await db.AviatorBet.findAll({
        where: { gameId },
        include: [{ model: db.User, as: 'user' }]
      });

      this.io.emit('updateBets', bets.map(b => ({
        userId: b.userId,
        amount: b.amount,
        cashoutMultiplier: b.cashoutMultiplier,
        username: b.user?.username || 'Anonymous'
      })));
    } catch (err) {
      console.error('❌ Aviator Bet Error:', err);
      this.socket?.emit('aviator:error', { message: 'Bet placement failed. Please try again.' });
    }
  }


  async handleCashout(data) {
    const { userId, gameId, multiplier, token } = data;

    try {
      // ✅ 1. Validate token
      if (!userId || !token) {
        return this.socket.emit('aviator:error', { message: 'Login required for cashout' });
      }

      const decoded = jwt.verify(token, secret);
      if (decoded.userId !== userId) {
        return this.socket.emit('aviator:error', { message: 'Invalid session token' });
      }

      // ✅ 2. Find the bet
      const bet = this.activeBets.get(`${userId}-${gameId}`);
      if (!bet) {
        return this.socket.emit('aviator:error', { message: 'No active bet found' });
      }

      // ✅ 3. Calculate winnings
      const winnings = bet.amount * multiplier;
      bet.cashoutMultiplier = multiplier;
      await bet.save();

      // ✅ 4. Credit user
      const user = await db.User.findByPk(userId, {
        include: [{ model: db.Wallet, as: 'wallet' }]
      });

      if (!user || !user.wallet) {
        return this.socket.emit('aviator:error', { message: 'User or wallet not found' });
      }

      user.wallet.balance += winnings;
      await user.wallet.save();

      await db.Transaction.create({
        userId,
        amount: winnings,
        type: 'credit',
        description: `Aviator cashout at ${multiplier}x`
      });

      this.socket.emit('aviator:cashoutSuccess', {
        amount: winnings,
        newBalance: user.wallet.balance
      });

      // ✅ 5. Update bets for all users
      const bets = await db.AviatorBet.findAll({
        where: { gameId },
        include: [{ model: db.User, as: 'user' }]
      });

      this.io.emit('updateBets', bets.map(b => ({
        userId: b.userId,
        amount: b.amount,
        cashoutMultiplier: b.cashoutMultiplier,
        username: b.user?.username || 'Anonymous'
      })));
    } catch (err) {
      console.error('❌ Aviator Cashout Error:', err);
      this.socket?.emit('aviator:error', { message: 'Cashout failed. Please try again.' });
    }
  }

  async handleCrash({ gameId, crashAt }) {
    try {
      const bets = Array.from(this.activeBets.values())
        .filter(b => b.gameId === gameId && !b.cashoutMultiplier);

      for (const b of bets) {
        await db.Transaction.create({
          userId: b.userId,
          amount: b.amount,
          type: 'debit',
          description: `Aviator crash at ${crashAt}x - Bet lost`
        });
        this.activeBets.delete(`${b.userId}-${gameId}`);
      }

      await db.AviatorGame.update(
        { multiplier: crashAt, completed: true },
        { where: { id: gameId } }
      );

      this.io.emit('aviator:crashed', { gameId, crashAt });

      setTimeout(() => {
        this.io.emit('aviator:countdownStart');
        setTimeout(() => AviatorSocketHandler.startInitialRound(this.io), 10000);
      }, 1000);
    } catch (err) {
      console.error('Aviator crash error:', err);
      this.socket?.emit('aviator:error', { message: err.message });
    }
  }

  async handleNewRound() {
    if (AviatorSocketHandler.isStartingRound) return;
    AviatorSocketHandler.isStartingRound = true;

    try {
      const crashPoint = this.calculateCrashPoint();
      const roundId = Date.now();
      const seed = crypto.randomBytes(16).toString('hex');
      const cipher = crypto.createHash('sha256').update(seed + roundId.toString()).digest('hex');

      const game = await db.AviatorGame.create({
        multiplier: 0,
        crashAt: crashPoint,
        completed: false
      });

      this.activeBets.clear();

      this.io.emit('aviator:newRound', {
        roundId: game.id,
        crashPoint,
        seed,
        cipher,
        startTime: Date.now() + 5000
      });

      setTimeout(() => {
        AviatorSocketHandler.isStartingRound = false;
      }, 10000);
    } catch (err) {
      AviatorSocketHandler.isStartingRound = false;
      console.error('New round error:', err);
    }
  }
}

module.exports = AviatorSocketHandler;
