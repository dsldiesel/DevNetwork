// Requires
const express = require('express');
// express validator, allows second parameter in routes with checks
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const SEED = config.get('SEED');

// Init vbles
const router = express.Router();
// Model
const User = require('../../models/User');

// Routes

// @route  POST api/users
// @desc   Register user
// @access Public
router.post(
  '/',
  [
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'Please type a valid email').isEmail(),
    check('pass', 'Please enter a password with 6 or more characters').isLength(
      { min: 6 }
    )
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
    const { name, email, pass } = req.body;
    try {
      // See if user exists
      let user = await User.findOne({ email });
      if (user) {
        // We clone error message structure as above in validation for coherence
        return res.status(400).json({
          errors: [{ msg: 'User exists already.' }]
        });
      }
      // Get users gravatar
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      });
      // Instance with encrypted pass
      const salt = await bcrypt.genSalt(10);
      user = new User({
        name,
        email,
        avatar,
        pass: await bcrypt.hash(pass, salt)
      });
      await user.save();
      // Return jsonwebtoken
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
