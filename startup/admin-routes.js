const express = require('express');
const login = require('../admin-routes/login');
const error = require('../middleware/error');

module.exports = function(app) {
  app.use(express.json());
  app.use('/admin', login);
  app.use(error);
}