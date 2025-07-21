const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = (req, res, next) => {
  try {
    // Session-based login
    if (req.session?.user) {
      req.userId = req.session.user.id;
      return next();
    }

    // JWT token from headers or cookies
    const authHeader = req.headers.authorization || req.cookies?.token;
    let token;

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (typeof authHeader === 'string') {
      token = authHeader;
    }

    if (!token) {
      // 👇 Redirect to login if it's a browser request
      if (req.accepts('html')) return res.redirect('/login');
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (req.accepts('html')) return res.redirect('/login');
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

