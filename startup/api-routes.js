const express = require('express');
const genres = require('../routes/api/genres');
const customers = require('../routes/api/customers');
const movies = require('../routes/api/movies');
const rentals = require('../routes/api/rentals');
const users = require('../routes/api/users');
const auth = require('../routes/api/auth');
const returns = require('../routes/api/returns');
const error = require('../middleware/error');

module.exports = function (app, io) {
  app.use('/api/genres', genres);
  app.use('/api/customers', customers);
  app.use('/api/movies', movies);
  app.use('/api/rentals', rentals);
  app.use('/api/users', users);
  app.use('/api/auth', auth);
  app.use('/api/returns', returns);
  app.use(error);
}