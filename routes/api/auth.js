const Joi = require('joi');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const { User } = require('../../models/user');
const setLocale = require('../../middleware/setLocale');
const { successMessage, errorMessage } = require('../../helpers/SocketHelper');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.post('/', setLocale, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return errorMessage(res, error.details[0], true);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return errorMessage(res, 'invalid_combination');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return errorMessage(res, 'invalid_combination');
  const token = user.generateAuthToken();
  return successMessage(res, 'success', 200, {
    'token': token
  });
});

function validate(req) {
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required()
  };

  return Joi.validate(req, schema);
}

module.exports = router; 
