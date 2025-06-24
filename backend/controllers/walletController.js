const { Wallet, Transaction, User } = require('../models');
const { sequelize } = require('../config/db');

module.exports = {
  getBalance: async (req, res) => {
    try {
      const wallet = await Wallet.findOne({
        where: { userId: req.userId },
        include: [{
          model: Transaction,
          as: 'transactions',
          limit: 10,
          order: [['createdAt', 'DESC']]
        }],
        attributes: ['id', 'balance']
      });

      if (!wallet) {
        return res.status(404).json({ message: 'Wallet not found' });
      }

      res.json({
        success: true,
        balance: wallet.balance,
        transactions: wallet.transactions
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  deposit: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { amount } = req.body;

      if (amount <= 0) {
        return res.status(400).json({ 
          success: false,
          message: 'Amount must be positive' 
        });
      }

      const [wallet, created] = await Wallet.findOrCreate({
        where: { userId: req.userId },
        defaults: { balance: 0 },
        transaction: t
      });

      await wallet.increment('balance', { 
        by: amount,
        transaction: t 
      });

      await Transaction.create({
        amount,
        type: 'deposit',
        walletId: wallet.id,
        status: 'completed'
      }, { transaction: t });

      await t.commit();

      res.json({ 
        success: true,
        balance: wallet.balance + amount,
        message: 'Deposit successful'
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  withdraw: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { amount } = req.body;

      if (amount <= 0) {
        return res.status(400).json({ 
          success: false,
          message: 'Amount must be positive' 
        });
      }

      const wallet = await Wallet.findOne({
        where: { userId: req.userId },
        transaction: t
      });

      if (!wallet || wallet.balance < amount) {
        return res.status(400).json({ 
          success: false,
          message: 'Insufficient balance' 
        });
      }

      await wallet.decrement('balance', { 
        by: amount,
        transaction: t 
      });

      await Transaction.create({
        amount: -amount,
        type: 'withdrawal',
        walletId: wallet.id,
        status: 'pending' // Will update when payment processed
      }, { transaction: t });

      await t.commit();

      res.json({ 
        success: true,
        balance: wallet.balance - amount,
        message: 'Withdrawal request submitted'
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }
};