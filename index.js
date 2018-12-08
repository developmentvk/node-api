const morgan = require('morgan');
const winston = require('winston');
const express = require('express'),
    i18n = require("i18n");
const app = express();
const http = require('http');
const socketIO = require('socket.io');
const ejsLayouts = require("express-ejs-layouts");


i18n.configure({
    locales: ['en', 'ar'],
    directory: __dirname + '/locales',
    // you may alter a site wide default locale
    defaultLocale: 'en',
    // query parameter to switch locale (ie. /home?locale=ar) - defaults to NULL
    queryParameter: 'locale',
});
app.use(i18n.init);

app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.set('views', './views');// default
app.use(express.static(__dirname+'/public'));

const port = process.env.PORT || 3000;
const appServer = http.createServer(app);
const io = socketIO(appServer);

require('./startup/logging')();
require('./startup/api-routes')(app, io);
require('./startup/admin-routes')(app, io);
require('./startup/site-routes')(app, io);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();
require('./startup/prod')(app);

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function (req, res) {
    res.render('404', {"header" : false });
});

if (app.get('env') === 'development') {
    app.use(morgan('tiny'));
    winston.info("Morgan enabled...");
}

const server = appServer.listen(port, () => winston.info(`Listening on port ${port}...`));

module.exports = server;
