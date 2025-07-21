const express = require('express');
const router = express.Router();
const controller = require('./cricketController');

router.get('/', controller.renderCricketGame); // ✔️ public page

module.exports = router;
