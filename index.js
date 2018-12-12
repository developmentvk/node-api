const morgan = require('morgan'),
    winston = require('winston'),
    cookieSession = require('cookie-session'),
    express = require('express'),
    i18n = require("i18n"),
    Keygrip = require('keygrip'),
    app = express(),
    http = require('http'),
    socketIO = require('socket.io'),
    ejsLayouts = require("express-ejs-layouts"),
    cookieParser = require('cookie-parser'),
    flash = require('connect-flash'),
    bodyParser = require('body-parser');

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
app.use(express.static(__dirname + '/public'));
app.use(flash());

// initialize cookie-parser to allow us access the cookies stored in the browser. 
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('trust proxy', 1) // trust first proxy

app.use(cookieSession({
    name: 'session',
    keys: new Keygrip(['dKxfdQqlGwIM172lCoOB78kwwulRrV7qSezov38jlkPU6LG2xQyXh2DoFDD8', 'dKxfdQqlGwIM172lCoOB78kwwulRrJKJKJKJKzov38jlkPU6LG2xQyXh2DoFDD8'], 'SHA384', 'base64'),
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
    // Update a value in the cookie so that the set-cookie will be sent.
    // Only changes every minute so that it's not sent with every request.
    req.session.nowInMinutes = Math.floor(Date.now() / 60e3);
    if (req.cookies.session && !req.session.admin) {
        res.clearCookie('session');
    }
    next();
});

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
app.all('*', function (req, res) {
    res.render('404', { "header": false, "layout": "layout" });
});

if (app.get('env') === 'development') {
    // set morgan to log info about our requests for development use.
    app.use(morgan('tiny'));
    winston.info("Morgan enabled...");
}

const server = appServer.listen(port, () => winston.info(`Listening on port ${port}...`));

module.exports = server;
