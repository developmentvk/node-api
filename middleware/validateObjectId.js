const mongoose = require('mongoose');
const {errorMessage} = require('../helpers/SocketHelper');

module.exports = function(req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return errorMessage(res, 'invalid_id');
  
  next();
}