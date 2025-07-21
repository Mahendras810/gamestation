const db = require('../../config/db');
const { AviatorGame, Transaction, User, Wallet, Bet } = db;

exports.renderAviatorGame = async (req, res) => {
  try {
    let user = null;
    let walletBalance = 0;

    if (req.session.user) {
      user = await User.findByPk(req.session.user.id, {
        include: [{ model: Wallet, as: 'wallet' }]
      });

      if (user && user.wallet) {
        walletBalance = parseFloat(user.wallet.balance);
      }
    }

    // Dummy round history mapping size by multiplier
    const rounds = await AviatorGame.findAll({
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    const last50Rounds = rounds.map(r => ({
      multiplier: r.multiplier,
      size: r.multiplier >= 50 ? 3 : r.multiplier >= 10 ? 2 : 1
    }));

    // Dummy bet data for now (replace with actual Bet table queries if needed)
    const allBets = [
      { username: 'player1', amount: 100, multiplier: 2.1 },
      { username: 'player2', amount: 200, multiplier: 3.5 }
    ];

    const myBets = user ? [
      { amount: 100, multiplier: 2.1 }
    ] : [];

    const topBets = [
      { username: 'proPlayer', amount: 1000, multiplier: 10.0 }
    ];

    res.render('games/aviator', {
      title: 'Aviator Game',
      user: user ? {
        id: user.id,
        username: user.username,
        walletBalance
      } : null,
      allBets,
      myBets,
      topBets,
      last50Rounds,
      currentRound: {
        id: Date.now(),
        seed: '',
        result: '',
        cipher: ''
      }
    });

  } catch (err) {
    console.error('❌ Aviator Render Error:', err.message);
    res.send('❌ Error loading aviator game.');
  }
};
exports.saveResult = async (req, res) => {
  try {
    // You can update round data here (replace with actual logic)
    console.log('Saving result:', req.body);
    res.json({ success: true, message: 'Result saved.' });
  } catch (err) {
    console.error('❌ Save Result Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to save result.' });
  }
};

