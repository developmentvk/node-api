const morgan = require('morgan');
const winston = require('winston');
const express = require('express'),
    i18n = require("i18n");
const app = express();
const http = require('http');
const socketIO = require('socket.io');
const ejsLayouts = require("express-ejs-layouts");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser');

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

// initialize express-session to allow us track the logged-in user across sessions.
app.use(session({
    key: 'sid',
    secret: 'dKxfdQqlGwIM172lCoOB78kwwulRrV7qSezov38jlkPU6LG2xQyXh2DoFDD8',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
    if (req.cookies.sid && !req.session.user) {
        res.clearCookie('sid');
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
app.get('*', function (req, res) {
    res.render('404', { "header": false, "layout": "layout" });
});

if (app.get('env') === 'development') {
    // set morgan to log info about our requests for development use.
    app.use(morgan('tiny'));
    winston.info("Morgan enabled...");
}

const server = appServer.listen(port, () => winston.info(`Listening on port ${port}...`));

module.exports = server;
