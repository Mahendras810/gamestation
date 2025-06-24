const { Game } = require('../models');

exports.getAllGames = async (req, res) => {
  try {
    const games = await Game.findAll({ 
      where: { active: true },
      attributes: ['id', 'name', 'description', 'thumbnail', 'minBet', 'maxBet']
    });
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};