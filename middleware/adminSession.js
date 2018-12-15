const pjson = require('../package.json');
module.exports = function (req, res, next) {
	try {
		req.session.admin.version = pjson.version;
		res.locals.adminAuthenticated = req.session.adminAuthenticated;
		res.locals.admin = req.session.admin;
		
		if (req.session.adminAuthenticated === true && req.cookies.session) {
			next();
		} else {
			return res.redirect('/admin/login');
		}
	} catch (ex) {
		return res.redirect('/admin/login');
	}
}