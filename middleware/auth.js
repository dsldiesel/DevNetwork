const jwt = require('jsonwebtoken');
const config = require('config');
const SEED = config.get('SEED');

exports.checkToken = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'No token in header, auth is denied.' });
  }
  // Token verification
  jwt.verify(token, SEED, (err, decoded) => {
    if (err) {
      return res.status(401).json({ msg: 'Wrong token!' });
    }
    // Add decoded user (user who logged in and got token) to have him or track him on who's done what
    req.user = decoded.user;
    // Continue with validated operation
    next();
  });
};
