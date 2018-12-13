const express = require('express');
const login = require('../routes/admin/login');
const dashboard = require('../routes/admin/dashboard');
const navigation = require('../routes/admin/navigation');
const log = require('../routes/admin/log');
const error = require('../middleware/error');

module.exports = function (app, io) {
  app.use('/admin', login);
  app.use('/admin', dashboard);
  app.use('/admin', log);
  app.use('/admin', navigation);
  app.use(error);
}