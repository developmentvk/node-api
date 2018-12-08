const jwt = require('jsonwebtoken');
const config = require('config');
const { errorMessage } = require('../helpers/SocketHelper');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return errorMessage(res, 'no_token_provided', false, 401);

  try {
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    req.user = decoded;
    next();
  }
  catch (ex) {
    errorMessage(res, 'invalid_token', false, 400);
  }
}