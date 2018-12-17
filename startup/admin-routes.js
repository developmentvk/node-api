const express = require('express');
const login = require('../routes/admin/login');
const dashboard = require('../routes/admin/dashboard');
const log = require('../routes/admin/log');
const navigation = require('../routes/admin/navigation');
const role = require('../routes/admin/role');
const admin = require('../routes/admin/admin');
const countries = require('../routes/admin/countries');
const error = require('../middleware/error');

module.exports = function (app, io) {
  app.use('/admin', login);
  app.use('/admin', dashboard);
  app.use('/admin', log);
  app.use('/admin', navigation);
  app.use('/admin', role);
  app.use('/admin', admin);
  app.use('/admin', countries);
  app.use(error);
}