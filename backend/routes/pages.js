const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const db = require('../config/db');

// Home page
const FAKE_WINNERS = [
  { username: 'demoUser1', amount: 200 },
  { username: 'demoUser2', amount: 350 },
  { username: 'demoUser3', amount: 500 },
  { username: 'demoUser4', amount: 120 },
  { username: 'demoUser5', amount: 275 }
];

router.get('/', async (req, res) => {
  const user = req.session.user || null;

  const lastWinners = await db.Transaction.findAll({
    where: { type: 'win' },
    limit: 5,
    order: [['createdAt', 'DESC']],
    include: [{ model: db.User, as: 'user' }]
  });

  const winnersToShow = lastWinners.length
    ? lastWinners.map(w => ({
        username: w.user?.username || 'User',
        amount: w.amount
      }))
    : FAKE_WINNERS;

  res.render('dashboard', {
    title: 'Dashboard',
    user,
    lastWinners: winnersToShow
  });
});




// Login and Register pages
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('token'); // in case you set it in cookies
    res.redirect('/login');
  });
});


router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

// Dashboard after login
router.get('/dashboard', async (req, res) => {
  const user = req.session.user || null;

  const lastWinners = await db.Transaction.findAll({
    where: { type: 'win' },
    limit: 5,
    order: [['createdAt', 'DESC']],
    include: [{ model: db.User, as: 'user' }]
  });

  const winnersToShow = lastWinners.length
    ? lastWinners.map(w => ({
        username: w.user?.username || 'User',
        amount: w.amount
      }))
    : FAKE_WINNERS;

  res.render('dashboard', {
    title: 'Dashboard',
    user,
    lastWinners: winnersToShow
  });
});



// Profile Page
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = req.session.user || req.user;

    if (!user) {
      return res.redirect('/login');
    }

    res.render('profile', { title: 'Profile', user });
  } catch (err) {
    res.status(500).send("Error loading profile");
  }
});


module.exports = router;
