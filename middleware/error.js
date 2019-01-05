const winston = require('winston');
const { errorMessage } = require('../helpers/SocketHelper');

module.exports = function (err, req, res, next) {
    winston.error(err.message, err);

    // error
    // warn
    // info
    // verbose
    // debug 
    // silly

    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        errorMessage(res, 'server_down', false, 500);
    } else {
        res.render('500', { header: false, layout: "layout", title: "500" });
    }

}