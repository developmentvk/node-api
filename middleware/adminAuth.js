
module.exports = function (req, res, next) {
	try {
		if (req.session.adminAuthenticated === true && req.cookies.session) {
			return res.redirect('/admin/dashboard');
		} else {
			next();
		}
	} catch (ex) {
		next();
	}
}