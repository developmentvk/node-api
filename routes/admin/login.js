const express = require('express');
const mongoose = require('mongoose');
const adminAuth = require('../../middleware/adminAuth');
const { AdminLoginLogs } = require('../../models/adminLoginLogs');
const { Sessions } = require('../../models/sessions');
const { Admin, validateLogin, validateForgotPassword, validateUpdatePassword } = require('../../models/admin');
const i18n = require("i18n");
const TokenGenerator = require('uuid-token-generator');
const bcrypt = require('bcrypt');
const { sendEmail, navigationMenuListing } = require('../../helpers/MyHelper');
const browser = require('browser-detect');
const _ = require('lodash');
const router = express.Router();

router.get('/login', adminAuth, async (req, res) => {
    if (req.query.logout === 'true') {
        req.flash('success', [i18n.__('logged_out_successfully')]);
    }

    if (req.query.logout === 'duplicate') {
        req.flash('success', [i18n.__('logged_out_duplicate_session_successfully')]);
    }

    if (req.query.logout === 'terminated') {
        req.flash('success', [i18n.__('logged_out_session_terminated_successfully')]);
    }

    let error = req.flash('error');
    let success = req.flash('success');
    res.render('admin/login', {
        layout: "admin/include/loginLayout",
        title: i18n.__('login'),
        error: error,
        success: success
    });
});

router.post('/login', async (req, res) => {
    const { error } = validateLogin(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect('/admin/login');
    }

    let admin = await Admin.findOne({ email: req.body.username });
    if (!admin) {
        req.flash('error', [i18n.__('invalid_combination')]);
        return res.redirect('/admin/login');
    }
    const validPassword = await bcrypt.compare(req.body.password, admin.password);
    if (!validPassword) {
        req.flash('error', [i18n.__('invalid_combination')]);
        return res.redirect('/admin/login');
    }

    let adminLoginLogsExists = await AdminLoginLogs.find({
        admin_id: admin._id,
        isActive: true
    }).exec();
    if (adminLoginLogsExists.length > 0) {
        _.forEach(adminLoginLogsExists, async function (value) {
            await Sessions.deleteOne({ "session.admin.login_id": value._id });

            await AdminLoginLogs.findByIdAndUpdate(value._id, {
                logout_at: new Date(),
                isActive: false
            }, { new: true });
        })

        req.app.io.emit("logoutSessionEvent", {
            admin_id: admin._id,
            action: 'duplicate'
        });
    }

    const adminLoginLogs = await new AdminLoginLogs({
        admin_id: admin._id,
        browser: JSON.stringify(browser(req.headers['user-agent'])),
        session_id: req.sessionID,
    }).save();

    admin = JSON.parse(JSON.stringify(admin));
    admin.login_id = adminLoginLogs._id;

    req.session.adminAuthenticated = true;
    req.session.admin = admin;
    if (req.body.rememberme) {
        req.session.cookie.maxAge = (24 * 30) * 60 * 60 * 1000 // 30 days;
    } else {
        req.session.cookie.maxAge = (24 * 7) * 60 * 60 * 1000 // 7 days;
    }

    await navigationMenuListing(req, true);

    return res.redirect('/admin/dashboard');
});

router.get('/forgot-password', adminAuth, async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');

    res.render('admin/forgot-password', {
        layout: "admin/include/loginLayout",
        title: i18n.__('forgot_password'),
        error: error,
        success: success,
    });
});

router.post('/forgot-password', async (req, res) => {
    const { error } = validateForgotPassword(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect('/admin/forgot-password');
    }

    let admin = await Admin.findOne({ email: req.body.email });
    if (!admin) {
        req.flash('error', [i18n.__('email_not_exist')]);
        return res.redirect('/admin/forgot-password');
    }
    const remember_token = new TokenGenerator(256, TokenGenerator.BASE62).generate();
    var buildUrl = req.protocol + '://' + req.get('host') + `/admin/create-password/${remember_token}/${admin._id}`;
    await Admin.findByIdAndUpdate(admin._id, { remember_token: remember_token }, { new: true });

    let options = {
        'name': admin.name,
        'buildUrl': buildUrl
    };
    sendEmail(admin.email, 'forgot-password', options, i18n.__('password_recovery_subject'));

    req.flash('success', [i18n.__('password_recovery_instruction')]);
    return res.redirect('/admin/forgot-password');
});

router.get('/create-password/:remember_token/:id', adminAuth, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        req.flash('error', [i18n.__('password_recovery_link_expired')]);
        return res.redirect('/admin/forgot-password');
    }

    let admin = await Admin.findOne({ remember_token: req.params.remember_token, _id: req.params.id });
    if (!admin) {
        req.flash('error', [i18n.__('password_recovery_link_expired')]);
        return res.redirect('/admin/forgot-password');
    }

    res.render('admin/create-password', {
        layout: "admin/include/loginLayout",
        title: i18n.__('create_password'),
    });
});

router.post('/create-password/:remember_token/:id', adminAuth, async (req, res) => {
    const { error } = validateUpdatePassword(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect(`/admin/create-password/${req.params.remember_token}/${req.params.id}`);
    }

    let admin = await Admin.findOne({ remember_token: req.params.remember_token, _id: req.params.id });
    if (!admin) {
        req.flash('error', [i18n.__('password_recovery_link_expired')]);
        return res.redirect('/admin/forgot-password');
    }
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);

    await Admin.findByIdAndUpdate(admin._id, { remember_token: null, password: password }, { new: true });

    let options = {
        'name': admin.name,
    };
    sendEmail(admin.email, 'create-password', options, i18n.__('password_changed_subject'));

    req.flash('success', [i18n.__('password_changed')]);
    return res.redirect('/admin/login');
});


module.exports = router; 
