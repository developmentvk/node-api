const express = require('express');
const login = require('../routes/admin/login');
const dashboard = require('../routes/admin/dashboard');
const error = require('../middleware/error');

module.exports = function (app, io) {
  app.use('/admin', login);
  app.use('/admin/dashboard', dashboard);
  app.use(error);
}