const express = require('express');
const router = express.Router();
// Insert auth middleware for all protected routes:
const auth = require('../../middleware/auth');
// express validator, allows second/third parameter in routes with checks
const { check, validationResult } = require('express-validator');
// Models:
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route  GET api/profile/me
// @desc   Get own profile
// @access Private
router.get('/me', auth.checkToken, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      // This req.user is inserted by middleware
      'user',
      ['name', 'avatar']
    );
    if (!profile) {
      return res.status(400).json({
        msg: 'No profile found for this user'
      });
    }
    // OK:
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error!');
  }
});

// @route  POST api/profile
// @desc   Create or update profile
// @access Private
router.post(
  '/',
  [
    auth.checkToken,
    [
      check('status', 'Status is required.')
        .not()
        .isEmpty(),
      check('skills', 'You need to add some skills')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Validation errors found
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    profileFields.status = status;
    profileFields.skills = skills.split(',').map(skill => skill.trim());
    company
      ? (profileFields.company = company)
      : (profileFields.company = null);
    website
      ? (profileFields.website = website)
      : (profileFields.website = null);
    location
      ? (profileFields.location = location)
      : (profileFields.location = null);
    bio ? (profileFields.bio = bio) : (profileFields.bio = null);
    githubusername
      ? (profileFields.githubusername = githubusername)
      : (profileFields.githubusername = null);

    // Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      // Using upsert option (creates new doc if no match is found):
      let profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true, upsert: true }
      );
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
