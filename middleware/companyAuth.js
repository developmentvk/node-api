
module.exports = function (req, res, next) {
	try {
		if (req.session.companyAuthenticated === true && req.cookies.session) {
			return res.redirect('/company/dashboard');
		} else {
			next();
		}
	} catch (ex) {
		next();
	}
}