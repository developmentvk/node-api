const {Movie, validate} = require('../models/movie'); 
const {Genre} = require('../models/genre');
const setLocale = require('../middleware/setLocale');
const {successMessage, errorMessage} = require('../helpers/SocketHelper');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/', setLocale, async (req, res) => {
  const movies = await Movie.find().sort('name');
  return successMessage(res, 'success', 200, movies);
});

router.post('/', setLocale, async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return errorMessage(res, error.details[0], true);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return errorMessage(res, 'invalid_genre');

  const movie = new Movie({ 
    title: req.body.title,
    genre: {
      _id: genre._id,
      name: genre.name
    },
    numberInStock: req.body.numberInStock,
    dailyRentalRate: req.body.dailyRentalRate
  });
  await movie.save();
  
  return successMessage(res, 'success', 201, movie);
});

router.put('/:id', setLocale, async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return errorMessage(res, error.details[0], true);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return errorMessage(res, 'invalid_genre');

  const movie = await Movie.findByIdAndUpdate(req.params.id,
    { 
      title: req.body.title,
      genre: {
        _id: genre._id,
        name: genre.name
      },
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate
    }, { new: true });

  if (!movie) return errorMessage(res, 'no_movie_found');
  
  return successMessage(res, 'success', 200, movie);
});

router.delete('/:id', setLocale, async (req, res) => {
  const movie = await Movie.findByIdAndRemove(req.params.id);

  if (!movie) return errorMessage(res, 'no_movie_found');

  return successMessage(res, 'success', 200, movie);
});

router.get('/:id', setLocale, async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie) return errorMessage(res, 'no_movie_found');

  return successMessage(res, 'success', 200, movie);
});

module.exports = router; 