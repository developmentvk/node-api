const auth = require('../middleware/auth');
const setLocale = require('../middleware/setLocale');
const {successMessage, errorMessage} = require('../helpers/SocketHelper');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const {User, validate} = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/me', [setLocale, auth], async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  return successMessage(res, 'success', 200, user);
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return errorMessage(res, error.details[0], true);

  let user = await User.findOne({ email: req.body.email });
  if (user) return errorMessage(res, 'user_already_registered');

  user = new User(_.pick(req.body, ['name', 'email', 'password']));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  return successMessage(res, 'success', 200, {
    'token' : token,
    'data' : _.pick(user, ['_id', 'name', 'email'])
  });
});

module.exports = router; 
