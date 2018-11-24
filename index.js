const winston = require('winston');
const express = require('express'),
        i18n = require("i18n");
const app = express();

require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();

i18n.configure({
    locales:['en', 'ar'],
    directory: __dirname + '/locales',
    // you may alter a site wide default locale
    defaultLocale: 'en',
    // query parameter to switch locale (ie. /home?locale=ar) - defaults to NULL
    queryParameter: 'locale',
});
app.use(i18n.init);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => winston.info(`Listening on port ${port}...`));

module.exports = server;

// for Windows : $env:NODE_ENV="production" 
// for Other: export NODE_ENV="production"
/**
 * $env:NODE_ENV="production"
 * $env:NODE_ENV="development"
 * $env:app_password=123456
 * $env:nodeapi_jwtPrivateKey=123456
 * $env:DEBUG="app:startup,app:db"
 * $env:DEBUG="app:*"
 */
// console.log(`NODE_ENV: ${process.env.NODE_ENV}`);