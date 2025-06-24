const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const authMiddleware = require('../middlewares/auth');

// Apply auth middleware to all wallet routes
router.use(authMiddleware);

router.get('/', walletController.getBalance);
router.post('/deposit', walletController.deposit);
router.post('/withdraw', walletController.withdraw);

module.exports = router;