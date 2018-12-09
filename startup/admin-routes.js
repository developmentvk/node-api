const express = require('express');
const login = require('../routes/admin/login');
const error = require('../middleware/error');

module.exports = function (app, io) {
  app.use('/admin', login);
  app.use(error);
}