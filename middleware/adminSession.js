module.exports = function (req, res, next) {
	try {
		if (req.session.admin && req.cookies.sid) {
			next();
		} else {
			return res.redirect('/admin/login');
		}
	} catch (ex) {
		return res.redirect('/admin/login');
	}
}