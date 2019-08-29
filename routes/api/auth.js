const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const config = require('config');
const SEED = config.get('SEED');

const User = require('../../models/User');

// @route  GET api/auth
// @desc   Get auth user
// @access Public
// Will be hit on every single app loading, and will validate token plus send user back if ok
router.get('/', auth.checkToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-pass'); // We have the id of decoded user in req, from the middleware checkToken; We remove pass
    res.status(200).json(user);
  } catch (err) {
    //console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route  POST api/auth
// @desc   Login user and get token
// @access Public
router.post(
  '/',
  [
    check('email', 'Please type a valid email').isEmail(),
    check('pass', 'Please enter a password').exists()
  ],
  // Adding async here will allow await when finding users below
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Validation errors found
      return res.status(400).json({
        errors: errors.array()
      });
    }
    const { email, pass } = req.body;
    try {
      // Check if user exists
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          errors: [{ msg: 'Invalid credentials' }]
        });
      }
      // Check pass now:
      const isMatch = await bcrypt.compareSync(pass, user.pass);
      if (!isMatch) {
        return res.status(400).json({
          errors: [{ msg: 'Invalid credentials' }]
        });
      }

      const payload = {
        user: {
          id: user.id
        }
      };
      jwt.sign(
        payload,
        SEED,
        { expiresIn: 14400 }, //4 hours
        (err, token) => {
          if (err) throw err;
          res.status(200).json({ token });
        }
      );
    } catch (err) {
      res.status(500).send('Server error: ' + err.message);
    }
  }
);

module.exports = router;
