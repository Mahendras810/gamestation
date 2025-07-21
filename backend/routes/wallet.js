const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const authMiddleware = require('../middlewares/auth');

// Apply auth middleware to all wallet routes
router.use(authMiddleware);

router.get('/', walletController.getBalance);
router.post('/deposit', walletController.deposit);
router.post('/withdraw', walletController.withdraw);
router.get('/balance', authMiddleware, async (req, res) => {
  const wallet = await db.Wallet.findOne({ where: { userId: req.user.id } });
  res.json({ success: true, balance: wallet?.balance || 0 });
});


module.exports = router;