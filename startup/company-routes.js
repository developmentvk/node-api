const express = require('express');
const login = require('../routes/company/login');
const dashboard = require('../routes/company/dashboard');
const company = require('../routes/company/company');
const error = require('../middleware/error');
module.exports = function (app) {
  app.use('/company', login);
  app.use('/company', dashboard);
  app.use('/company', company);
  app.use(error);
}