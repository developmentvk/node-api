const { errorMessage } = require('../helpers/MyHelper');
module.exports = (validator) => {
  return (req, res, next) => {
    const { error } = validator(req.body);
    if (error) return errorMessage(res, error.details[0], true);
    next();
  }
}
