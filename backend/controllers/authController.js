const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      // Check if user exists
      const existingUser = await User.findOne({
        where: { email },
        attributes: ['id', 'username', 'email', 'password']
      });

      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword
      });

      // Create token
      const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

      res.status(201).json({ 
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.unscoped().findOne({ where: { email } });
      if (!user || !user.password) {
        return res.status(401).render('login', { title: 'Login', error_msg: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).render('login', { title: 'Login', error_msg: 'Invalid credentials' });
      }

      // Save user in session
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email
      };

      res.redirect('/dashboard');
    } catch (error) {
      console.error("Login error:", error.message);
      res.status(500).render('login', { title: 'Login', error_msg: 'Internal server error' });
    }
  }
};

module.exports = authController;
