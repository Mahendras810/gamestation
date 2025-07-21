const { Wallet, Transaction, User } = require('../models');
const { sequelize } = require('../config/db');

module.exports = {
  getBalance: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const offset = (page - 1) * limit;

      const wallet = await Wallet.findOne({
        where: { userId: req.userId },
        include: [{
          model: Transaction,
          as: 'transactions',
          order: [['createdAt', 'DESC']],
          limit,
          offset
        }],
        attributes: ['id', 'balance']
      });

      if (!wallet) {
        return res.status(404).json({ message: 'Wallet not found' });
      }

      const user = await User.findByPk(req.userId);

      res.render('wallet', {
        user,
        wallet,
        transactions: wallet.transactions,
        page,
        limit
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

      wallet.balance += parseFloat(amount);
      await wallet.save({ transaction: t });

      await Transaction.create({
        amount,
        type: 'deposit',
        walletId: wallet.id,
        userId: req.userId,
        status: 'completed'
      }, { transaction: t });

      await t.commit();

      req.flash('success', 'Deposit successful');
      res.redirect('/wallet');
    } catch (error) {
      await t.rollback();
      req.flash('error', error.message);
      res.redirect('/wallet');
    }
  },

  withdraw: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { amount } = req.body;

      if (amount <= 0) {
        req.flash('error', 'Amount must be positive');
        return res.redirect('/wallet');
      }

      const wallet = await Wallet.findOne({
        where: { userId: req.userId },
        transaction: t
      });

      if (!wallet || wallet.balance < amount) {
        req.flash('error', 'Insufficient balance');
        return res.redirect('/wallet');
      }

      wallet.balance -= parseFloat(amount);
      await wallet.save({ transaction: t });

      await Transaction.create({
        amount: -amount,
        type: 'withdrawal',
        walletId: wallet.id,
        userId: req.userId,
        status: 'pending'
      }, { transaction: t });

      await t.commit();

      req.flash('success', 'Withdrawal request submitted');
      res.redirect('/wallet');
    } catch (error) {
      await t.rollback();
      req.flash('error', error.message);
      res.redirect('/wallet');
    }
  }
};
