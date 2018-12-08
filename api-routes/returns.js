const Joi = require('joi');
const validate = require('../middleware/validate');
const { Rental } = require('../models/rental');
const { Movie } = require('../models/movie');
const setLocale = require('../middleware/setLocale');
const { successMessage, errorMessage } = require('../helpers/SocketHelper');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

router.post('/', [setLocale, auth, validate(validateReturn)], async (req, res) => {
  const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

  if (!rental) return errorMessage(res, 'rental_not_found');

  if (rental.dateReturned) return errorMessage(res, 'return_already_processed');

  rental.return();
  await rental.save();

  await Movie.update({ _id: rental.movie._id }, {
    $inc: { numberInStock: 1 }
  });

  return successMessage(res, 'success', 200, rental);
});

function validateReturn(req) {
  const schema = {
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required()
  };

  return Joi.validate(req, schema);
}

module.exports = router;
