// routes/index.js
const express = require('express');
const router = express.Router();

const pagesRoutes = require('./pages');
const authRoutes = require('./auth');
const walletRoutes = require('./wallet');
const cricketRoutes = require('../games/cricket/routes');
const aviatorRoutes = require('./games/aviator');

router.use('/', pagesRoutes);
router.use('/auth', authRoutes);
router.use('/wallet', walletRoutes);
router.use('/games/cricket', cricketRoutes);
router.use('/games/aviator', aviatorRoutes);

module.exports = router;
