// routes/aviator.js
const express = require('express');
const router = express.Router();
const db = require('../../models');
const AviatorGame = db.AviatorGame;
const aviatorController = require('./aviatorController');

router.get('/', aviatorController.renderAviatorGame);
router.post('/save-result', aviatorController.saveResult);

router.get('/api/aviator/history', async (req, res) => {
  try {
    const rounds = await AviatorGame.findAll({
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json(rounds);
  } catch (err) {
    console.error('History API error:', err);
    res.status(500).json({ error: 'Failed to load history' });
  }
});

module.exports = router;
