const { Game } = require('../../models');

exports.renderCricketGame = async (req, res) => {
  try {
    res.render('games/cricket', {
      title: 'Cricket Premier',
      user: req.session.user || null
    });
  } catch (err) {
    console.error('❌ Cricket Page Error:', err.message);
    res.send('❌ Error loading cricket game.');
  }
};
