const {errorMessage} = require('../helpers/SocketHelper');
module.exports = function (req, res, next) { 
  // 401 Unauthorized
  // 403 Forbidden 
  
  if (!req.user.isAdmin) return errorMessage(res, 'access_denied', false, 403);

  next();
}