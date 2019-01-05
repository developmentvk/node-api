const i18n = require("i18n");
const { errorMessage } = require('../helpers/MyHelper');

module.exports = function (req, res, next) {
    const locale = req.header('locale');
    if (!locale) return errorMessage(res, 'locale_required');
    try {
        i18n.setLocale(locale);
        next();
    } catch (ex) {
        errorMessage(res, 'locale_required');
    }
}