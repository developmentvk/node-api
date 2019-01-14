const pjson = require('../package.json');
const { navigationMenuListing } = require('../helpers/MyHelper');
module.exports = async function (req, res, next) {
	try {
		if (req.session.companyAuthenticated === true && req.cookies.session) {
			req.session.company.version = pjson.version;
			res.locals.companyAuthenticated = req.session.companyAuthenticated;
			res.locals.company = req.session.company;
			res.locals.params = req.params;
			res.locals.query = req.query;
			let current_pathname = req.path.split('/')[1];
			res.locals.current_pathname = `/company/${current_pathname}`;
			if(!req.session.company.hasOwnProperty('navigations')) { await navigationMenuListing(req); }
			
			next();
		} else {
			return res.redirect('/company/login');
		}
	} catch (ex) {
		return res.redirect('/company/login');
	}
}