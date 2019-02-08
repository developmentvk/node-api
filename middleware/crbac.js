const { hasModuleAccess } = require('../helpers/MyHelper');
const i18n = require("i18n");
const _ = require('lodash');
const mongoose = require('mongoose');
module.exports = async function (req, res, next) {
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        // send your xhr response here
    } else {
        let checkHasModuleAccess = false;
        let originalUrl = req.originalUrl;
        let urlArr = originalUrl.split("/");
        let mongoDBID = await _.last(urlArr);
        if(mongoose.Types.ObjectId.isValid(mongoDBID) == true && mongoDBID.length == 24) {
            urlArr.splice(-1,1);
            originalUrl = urlArr.join("/");
            checkHasModuleAccess = hasModuleAccess(req, originalUrl);
        } else {
            checkHasModuleAccess = hasModuleAccess(req, originalUrl);
        }
        if(checkHasModuleAccess !== true) {
            req.flash('error', [i18n.__('you_do_not_have_permission_to_access_this_module')]);
            return res.redirect('/company/dashboard');
            // return res.status(403).send(i18n.__('you_do_not_have_permission_to_access_this_module'));
        }
    }

    next();
}