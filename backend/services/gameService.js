const Game = require('../models/Game');
const Wallet = require('../models/Wallet');

class GameService {
  static async placeBet(userId, gameId, amount) {
    // वॉलेट से पैसे काटें
    const wallet = await Wallet.findOneAndUpdate(
      { user: userId, balance: { $gte: amount } },
      { $inc: { balance: -amount } },
      { new: true }
    );
    
    if (!wallet) {
      throw new Error('Insufficient balance');
    }
    
    return true;
  }

  static async settleBet(userId, gameId, amount, won) {
    const resultAmount = won ? amount * 2 : 0;
    
    await Wallet.findOneAndUpdate(
      { user: userId },
      { 
        $inc: { balance: resultAmount },
        $push: {
          transactions: {
            amount: resultAmount,
            type: won ? 'win' : 'loss',
            gameId
          }
        }
      }
    );
    
    return resultAmount;
  }
}

module.exports = GameService;