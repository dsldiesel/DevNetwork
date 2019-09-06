const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
// Insert auth middleware for all protected routes:
const auth = require('../../middleware/auth');
// express validator, allows second/third parameter in routes with checks
const { check, validationResult } = require('express-validator');
// Models:
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

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

// @route  GET api/profile
// @desc   Get all profiles
// @access Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error!');
  }
});

// @route  GET api/profile/user/:user_id
// @desc   Get profile by user id
// @access Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate('user', ['name', 'avatar']);
    if (!profile) return res.status(400).json({ msg: 'Profile not found' });

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      // Also show error if not a valid object ID
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.status(500).send('Server error!');
  }
});

// @route  DELETE api/profile
// @desc   Delete profile, user, posts
// @access Private
router.delete('/', auth.checkToken, async (req, res) => {
  try {
    // Remove user posts
    await Post.deleteMany({ user: req.user.id });
    // Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    // Remove user
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error!');
  }
});

// @route  PUT api/profile/experience
// @desc   Add profile experience
// @access Private
router.put(
  '/experience',
  [
    auth.checkToken,
    [
      check('title', 'Title is required.')
        .not()
        .isEmpty(),
      check('company', 'Company is required')
        .not()
        .isEmpty(),
      check('from', 'From date is required')
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
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;

    // Build profile object
    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      // Insert at beginning
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route  DELETE api/profile/experience/:exp_id
// @desc   Delete experience
// @access Private
router.delete('/experience/:exp_id', auth.checkToken, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    // get removal index
    const removeIndex = profile.experience
      .map(item => item.id)
      .indexOf(req.params.exp_id);
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error!');
  }
});

// @route  PUT api/profile/education
// @desc   Add profile education
// @access Private
router.put(
  '/education',
  [
    auth.checkToken,
    [
      check('school', 'School is required.')
        .not()
        .isEmpty(),
      check('degree', 'Degree is required')
        .not()
        .isEmpty(),
      check('from', 'From date is required')
        .not()
        .isEmpty(),
      check('fieldofstudy', 'Field of study is required')
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
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body;

    // Build profile object
    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      // Insert at beginning
      profile.education.unshift(newEdu);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route  DELETE api/profile/education/:edu_id
// @desc   Delete education
// @access Private
router.delete('/education/:edu_id', auth.checkToken, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    // get removal index
    const removeIndex = profile.education
      .map(item => item.id)
      .indexOf(req.params.edu_id);
    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error!');
  }
});

// @route  GET api/profile/github/:username
// @desc   Get user's repos from github
// @access Public
router.get('/github/:user', async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.user
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        'gHubClientId'
      )}&client_secret=${config.get('gHubClientSecret')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' }
    };
    request(options, (error, response, body) => {
      if (error) console.log(error);
      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: 'No github profile found!' });
      }
      // String comes, lets json it
      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error!');
  }
});

module.exports = router;
