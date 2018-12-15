const express = require('express');
const error = require('../middleware/error');

module.exports = function (app, io) {
  app.use(error);
}