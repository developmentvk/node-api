const express = require('express');
const home = require('../routes/site/home');
const error = require('../middleware/error');

module.exports = function (app, io) {
  app.use('/', home);
  app.use(error);
}