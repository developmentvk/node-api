const express = require('express');
const home = require('../site-routes/home');
const error = require('../middleware/error');

module.exports = function(app) {
  app.use(express.json());
  app.use('/', home);
  app.use(error);
}