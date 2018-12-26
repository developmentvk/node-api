const express = require('express'),
    _ = require('lodash'),
    winston = require('winston'),
    session = require('express-session'),
    i18n = require("i18n"),
    app = express(),
    http = require('http'),
    socketIO = require('socket.io'),
    ejsLayouts = require("express-ejs-layouts"),
    cookieParser = require('cookie-parser'),
    flash = require('connect-flash'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    MongoStore = require('connect-mongo')(session)
    ios = require('socket.io-express-session'),
    moment = require('moment-timezone').tz.setDefault("Asia/Calcutta"),
    numUsers = 0,
    port = process.env.PORT || 3000;

// console.log(moment.tz.guess());
//Socket.IO Connections
const appServer = http.createServer(app, function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
});

const io = app.io = socketIO(appServer);
app.locals._ = _;
app.locals.SocketHelper = require('./helpers/SocketHelper');

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

/**
 * initialize cookie-parser to allow us access the cookies stored in the browser. 
 */
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const store = new MongoStore({
    mongooseConnection: mongoose.connection,
    stringify: false, // if you want to store object instead of id
    autoRemove: 'interval', // Default native/interval
    autoRemoveInterval: 10, // In minutes. Default
    touchAfter: 24 * 3600 // time period in seconds means session be updated only one time in a period of 24 hours
});

const sess = {
    key: 'session',
    secret: 'dKxfdQqlGwIM172lCoOB78kwwulRrV7qSezov38jlkPU6LG2xQyXh2DoFDD8',
    cookie: {
        maxAge: 2 * 60 * 60 * 1000 // 2 hours
    },
    resave: true, //don't save session if unmodified
    saveUninitialized: true, // don't create session until something stored
    store: store
};

if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
}
app.use(session(sess));
io.use(ios(session(sess)));

/**
 * This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
 * This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
 */
app.use((req, res, next) => {
    res.locals.req = req;
    app.locals.req = req;
    if (req.cookies.session && req.session.adminAuthenticated !== true) {
        res.clearCookie('session');
        delete req.session.admin;
    }
    next();
});

io.on("connection", function (socket) {
    // winston.info('Socket connected with SID: ' + socket.handshake.sessionID);
    /**
     * Accept a login event with user's data
     */
    socket.on("login", function (userdata) {
        ++numUsers;
        winston.info(JSON.stringify(userdata));
        socket.handshake.session.userdata = userdata;
        socket.handshake.session.save();
    });

    socket.on("logout", function (userdata) {
        if (socket.handshake.session.userdata) {
            --numUsers;
            delete socket.handshake.session.userdata;
            socket.handshake.session.save();
        }
    });

    // socket.on("navigationUpdatedEvent", async function () {
    //     if(app.locals.req.session.admin.hasOwnProperty('navigations')) {
    //         await app.locals.SocketHelper.navigationMenuListing(app.locals.req);
    //     }
    // });

    socket.on('disconnect', () => {
        // winston.info('Socket dis-connected with SID: ' + socket.handshake.sessionID);
    });
    
});
app.use(require('./middleware/storeRequestLogs'));

require('./startup/logging')();
require('./startup/api-routes')(app);
require('./startup/admin-routes')(app);
require('./startup/site-routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();
require('./startup/prod')(app);

/**
 * The 404 Route (ALWAYS Keep this as the last route)
 */
app.all('*', function (req, res) {
    res.render('404', { header: false, layout: "layout", title: i18n.__('404_page') });
});

const server = appServer.listen(port, function () {
    let host = server.address().address;
    winston.info(`Websocket is running at ${host}:${port}`);
});

module.exports = server;