const express = require('express');
const genres = require('../api-routes/genres');
const customers = require('../api-routes/customers');
const movies = require('../api-routes/movies');
const rentals = require('../api-routes/rentals');
const users = require('../api-routes/users');
const auth = require('../api-routes/auth');
const returns = require('../api-routes/returns');
const error = require('../middleware/error');

module.exports = function (app, io) {
  app.use(express.json());
  app.use('/api/genres', genres);
  app.use('/api/customers', customers);
  app.use('/api/movies', movies);
  app.use('/api/rentals', rentals);
  app.use('/api/users', users);
  app.use('/api/auth', auth);
  app.use('/api/returns', returns);
  app.use(error);
}