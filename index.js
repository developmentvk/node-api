const morgan = require('morgan');
const winston = require('winston');
const express = require('express'),
        i18n = require("i18n");
const app = express();

i18n.configure({
    locales:['en', 'ar'],
    directory: __dirname + '/locales',
    // you may alter a site wide default locale
    defaultLocale: 'en',
    // query parameter to switch locale (ie. /home?locale=ar) - defaults to NULL
    queryParameter: 'locale',
});
app.use(i18n.init);

app.set('view engine', 'ejs');
app.set('views', './views');// default
app.use(express.static('public'));

require('./startup/logging')();
require('./startup/api-routes')(app);
require('./startup/admin-routes')(app);
require('./startup/site-routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();
require('./startup/prod')(app);

if(app.get('env') === 'development')
{
    app.use(morgan('tiny'));
    winston.info("Morgan enabled...");
}

const port = process.env.PORT || 3000;
const server = app.listen(port, () => winston.info(`Listening on port ${port}...`));

module.exports = server;
