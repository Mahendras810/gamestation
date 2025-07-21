const db = require('../models');
const Wallet = db.Wallet;
const Transaction = db.Transaction;

class GameService {
  static async placeBet(userId, amount) {
    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet || wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }

    wallet.balance -= amount;
    await wallet.save();
    return true;
  }

  static async getUserById(userId) {
    return await db.User.findByPk(userId, {
      include: [{ model: db.Wallet, as: 'wallet' }]
    });
  }


  static async settleBet(userId, amount, won, gameName = 'Game') {
    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) throw new Error('Wallet not found');

    const resultAmount = won ? amount * 2 : 0;
    wallet.balance += resultAmount;
    await wallet.save();

    await Transaction.create({
      userId,
      type: won ? 'win' : 'refund',
      amount: resultAmount,
      description: `${gameName} ${won ? 'Win' : 'Refund'}`
    });

    return resultAmount;
  }
}

module.exports = GameService;
