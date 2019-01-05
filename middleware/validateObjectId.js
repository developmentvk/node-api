const mongoose = require('mongoose');
const { errorMessage } = require('../helpers/MyHelper');

module.exports = function (req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return errorMessage(res, 'invalid_id');

  next();
}