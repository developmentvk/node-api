
const pjson = require('../package.json');
module.exports = function (req, res, next) {
	try {
		if (req.session.admin && req.cookies.session) {
			return res.redirect('/admin/dashboard');
		} else {
			next();
		}
	} catch (ex) {
		return res.redirect('/admin/login');
	}
}