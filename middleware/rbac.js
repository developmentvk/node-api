const { hasAccess } = require('../helpers/MyHelper');
const i18n = require("i18n");
const _ = require('lodash');
const mongoose = require('mongoose');
module.exports = async function (req, res, next) {
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        // send your xhr response here
    } else {
        let checkHasAccess = false;
        let originalUrl = req.originalUrl;
        let urlArr = originalUrl.split("/");
        let mongoDBID = await _.last(urlArr);
        if(mongoose.Types.ObjectId.isValid(mongoDBID) == true) {
            urlArr.splice(-1,1);
            originalUrl = urlArr.join("/");
            checkHasAccess = hasAccess(req, originalUrl);
        } else {
            checkHasAccess = hasAccess(req, originalUrl);
        }
        if(checkHasAccess !== true) {
            req.flash('error', [i18n.__('you_do_not_have_permission_to_access_this_module')]);
            return res.redirect('/admin/dashboard');
            // return res.status(403).send(i18n.__('you_do_not_have_permission_to_access_this_module'));
        }
    }

    next();
}