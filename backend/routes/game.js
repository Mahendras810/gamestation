const express = require('express');
const router = express.Router();
const { getAllGames } = require('../controllers/gameController');

router.get('/', getAllGames);

module.exports = router;