const express = require('express');
const home = require('../site-routes/home');
const error = require('../middleware/error');

module.exports = function (app, io) {
  app.use(express.json());
  app.set('layout', 'site/include/layout');
  app.use('/', home);
  app.use(error);
}