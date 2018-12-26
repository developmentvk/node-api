const { hasAccess } = require('../helpers/SocketHelper');
const i18n = require("i18n");

module.exports = function (req, res, next) {
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        // send your xhr response here
    } else {
        let checkHasAccess = hasAccess(req, req.originalUrl);
        if(checkHasAccess !== true) {
            req.flash('error', [i18n.__('you_do_not_have_permission_to_access_this_module')]);
            return res.redirect('/admin/dashboard');
            // return res.status(403).send(i18n.__('you_do_not_have_permission_to_access_this_module'));
        }
    }

    next();
}