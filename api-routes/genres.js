const validateObjectId = require('../middleware/validateObjectId');
const { successMessage, errorMessage } = require('../helpers/SocketHelper');
const setLocale = require('../middleware/setLocale');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { Genre, validate } = require('../models/genre');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/', setLocale, async (req, res) => {
  const genres = await Genre.find().sort('name');
  return successMessage(res, 'success', 200, genres);
});

router.post('/', [setLocale, auth], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return errorMessage(res, error.details[0], true);

  let genre = new Genre({ name: req.body.name });
  genre = await genre.save();

  return successMessage(res, 'success', 201, genre);
});

router.put('/:id', [setLocale, auth, validateObjectId], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return errorMessage(res, error.details[0], true);

  const genre = await Genre.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
    new: true
  });

  if (!genre) return errorMessage(res, 'no_genre_found');

  return successMessage(res, 'success', 200, genre);
});

router.delete('/:id', [setLocale, auth, admin, validateObjectId], async (req, res) => {
  const genre = await Genre.findByIdAndRemove(req.params.id);

  if (!genre) return errorMessage(res, 'no_genre_found');

  return successMessage(res, 'success', 200, genre);
});

router.get('/:id', [setLocale, validateObjectId], async (req, res) => {
  const genre = await Genre.findById(req.params.id);

  if (!genre) return errorMessage(res, 'no_genre_found');

  return successMessage(res, 'success', 200, genre);
});

module.exports = router;