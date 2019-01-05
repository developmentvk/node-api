const pjson = require('../package.json');
const { navigationMenuListing } = require('../helpers/MyHelper');
module.exports = async function (req, res, next) {
	try {
		if (req.session.adminAuthenticated === true && req.cookies.session) {
			req.session.admin.version = pjson.version;
			res.locals.adminAuthenticated = req.session.adminAuthenticated;
			res.locals.admin = req.session.admin;
			res.locals.params = req.params;
			res.locals.query = req.query;
			let current_pathname = req.path.split('/')[1];
			res.locals.current_pathname = `/admin/${current_pathname}`;
			if(!req.session.admin.hasOwnProperty('navigations')) { await navigationMenuListing(req); }
			
			next();
		} else {
			return res.redirect('/admin/login');
		}
	} catch (ex) {
		return res.redirect('/admin/login');
	}
}