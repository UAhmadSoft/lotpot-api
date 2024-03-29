const express = require('express');
const passport = require('passport');
const protect = require('../middlewares/protect');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { clientDomain } = require('../utils/constants');
const router = express.Router();

router.get(
  '/twitter',
  async (req, res, next) => {
    const { token } = req.query;
    if (!token) res.redirect(`${clientDomain}/account?error=notoken`);

    const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // 3- check user exits
    const currentUser = await User.findById(decode.id);
    if (!currentUser) {
      res.redirect(`${clientDomain}/account?error=noUserWithToken`);
    }

    req.session.user = currentUser._id;
    next();
  },
  passport.authenticate('twitter', { scope: ['profile'] })
);

router.get(
  '/twitter/callback',
  passport.authenticate('twitter', {
    successRedirect: `${clientDomain}/account`,
    failureRedirect: `${clientDomain}/account`,
    passReqToCallback: true,
  })
);

router.get(
  '/instagram',
  passport.authenticate('instagram', { scope: ['user_profile'] })
  // passport.authenticate('instagram', { failWithError: true })
);

router.get(
  '/instagram/callback/',
  (req, res, next) => {
    console.log(`req.query.code`, req.query.code);
    next();
  },
  passport.authenticate('instagram', {
    successRedirect: `${clientDomain}/account`,
    failureRedirect: `${clientDomain}/account`,
    failWithError: true,
  })
);

module.exports = router;
