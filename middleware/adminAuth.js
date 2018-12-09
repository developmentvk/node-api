const { errorMessage } = require('../helpers/SocketHelper');

module.exports = function (req, res, next) {
	try {
		if (req.session.user && req.cookies.sid) {
			res.redirect('/admin/dashboard');
		} else {
			next();
		}
	} catch (ex) {
		errorMessage(res, 'invalid_token', false, 400);
	}
}