const express = require('express');
const login = require('../routes/admin/login');
const dashboard = require('../routes/admin/dashboard');
const log = require('../routes/admin/log');
const navigation = require('../routes/admin/navigation');
const role = require('../routes/admin/role');
const admin = require('../routes/admin/admin');
const countries = require('../routes/admin/countries');
const industry = require('../routes/admin/industry');
const company = require('../routes/admin/company');
const subscription = require('../routes/admin/subscription');
const agent = require('../routes/admin/agent');
const chat = require('../routes/admin/chat');
const error = require('../middleware/error');

module.exports = function (app) {
  app.use('/admin', login);
  app.use('/admin', dashboard);
  app.use('/admin', log);
  app.use('/admin', navigation);
  app.use('/admin', role);
  app.use('/admin', admin);
  app.use('/admin', countries);
  app.use('/admin', industry);
  app.use('/admin', company);
  app.use('/admin', subscription);
  app.use('/admin/company', agent);
  app.use('/admin', chat);
  app.use(error);
}