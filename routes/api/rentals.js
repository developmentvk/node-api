const { Rental, validate } = require('../../models/rental');
const { Movie } = require('../../models/movie');
const { Customer } = require('../../models/customer');
const setLocale = require('../../middleware/setLocale');
const { successMessage, errorMessage } = require('../../helpers/SocketHelper');
const mongoose = require('mongoose');
const Fawn = require('fawn');
const express = require('express');
const router = express.Router();

Fawn.init(mongoose);

router.get('/', setLocale, async (req, res) => {
  const rentals = await Rental.find().sort('-dateOut');
  return successMessage(res, 'success', 200, rentals);
});

router.post('/', setLocale, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return errorMessage(res, error.details[0], true);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return errorMessage(res, 'invalid_customer');

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return errorMessage(res, 'invalid_movie');

  if (movie.numberInStock === 0) return errorMessage(res, 'movie_not_in_stock');

  let rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate
    }
  });

  try {
    new Fawn.Task()
      .save('rentals', rental)
      .update('movies', { _id: movie._id }, {
        $inc: { numberInStock: -1 }
      })
      .run();

    return successMessage(res, 'success', 200, rental);
  }
  catch (ex) {
    errorMessage(res, 'server_down', 500);
  }
});

router.get('/:id', setLocale, async (req, res) => {
  const rental = await Rental.findById(req.params.id);

  if (!rental) return errorMessage(res, 'no_rental_found');

  return successMessage(res, 'success', 200, rental);
});

module.exports = router; 