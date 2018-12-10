module.exports = function (req, res, next) {
	try {
		if (req.session.admin && req.cookies.sid) {
			return res.redirect('/admin/dashboard');
		} else {
			next();
		}
	} catch (ex) {
		return res.redirect('/admin/login');
	}
}