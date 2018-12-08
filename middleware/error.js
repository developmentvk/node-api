const winston = require('winston');
const { errorMessage } = require('../helpers/SocketHelper');

module.exports = function (err, req, res, next) {
  winston.error(err.message, err);

  // error
  // warn
  // info
  // verbose
  // debug 
  // silly

  errorMessage(res, 'server_down', false, 500);
}