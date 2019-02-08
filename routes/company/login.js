const express = require('express');
const mongoose = require('mongoose');
const companyAuth = require('../../middleware/companyAuth');
const { CompanyLoginLogs } = require('../../models/companyLoginLogs');
const { Sessions } = require('../../models/sessions');
const { Company, validateLogin, validateForgotPassword, validateUpdatePassword } = require('../../models/company');
const i18n = require("i18n");
const TokenGenerator = require('uuid-token-generator');
const bcrypt = require('bcrypt');
const { sendEmail, moduleMenuListing } = require('../../helpers/MyHelper');
const browser = require('browser-detect');
const _ = require('lodash');
const router = express.Router();

router.get('/login', companyAuth, async (req, res) => {
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
    res.render('company/login', {
        layout: "company/include/loginLayout",
        title: i18n.__('login'),
        error: error,
        success: success
    });
});

router.post('/login', async (req, res) => {
    const { error } = validateLogin(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect('/company/login');
    }

    let company = await Company.findOne({ 
        email: req.body.username,
        isArchive: false,
        isDeleted: false
    });
    if (!company) {
        req.flash('error', [i18n.__('invalid_combination')]);
        return res.redirect('/company/login');
    }

    const validPassword = await bcrypt.compare(req.body.password, company.password);
    if (!validPassword) {
        req.flash('error', [i18n.__('invalid_combination')]);
        return res.redirect('/company/login');
    }

    let companyLoginLogsExists = await CompanyLoginLogs.find({
        company_id: company._id,
        isActive: true
    }).exec();
    if (companyLoginLogsExists.length > 0) {
        _.forEach(companyLoginLogsExists, async function (value) {
            await Sessions.deleteOne({ "session.company.login_id": value._id });

            await CompanyLoginLogs.findByIdAndUpdate(value._id, {
                logout_at: new Date(),
                isActive: false
            }, { new: true });
        })

        req.app.io.emit("logoutDuplicateSessionEvent", {
            company_id: company._id,
            action: 'duplicate'
        });
    }

    const companyLoginLogs = await new CompanyLoginLogs({
        company_id: company._id,
        browser: JSON.stringify(browser(req.headers['user-agent'])),
        session_id: req.sessionID,
    }).save();

    company = JSON.parse(JSON.stringify(company));
    company.login_id = companyLoginLogs._id;

    req.session.companyAuthenticated = true;
    req.session.company = company;
    if (req.body.rememberme) {
        req.session.cookie.maxAge = (24 * 30) * 60 * 60 * 1000 // 30 days;
    } else {
        req.session.cookie.maxAge = (24 * 7) * 60 * 60 * 1000 // 7 days;
    }

    // await moduleMenuListing(req, true);

    return res.redirect('/company/dashboard');
});

router.get('/forgot-password', companyAuth, async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');

    res.render('company/forgot-password', {
        layout: "company/include/loginLayout",
        title: i18n.__('forgot_password'),
        error: error,
        success: success,
    });
});

router.post('/forgot-password', async (req, res) => {
    const { error } = validateForgotPassword(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect('/company/forgot-password');
    }

    let company = await Company.findOne({ 
        email: req.body.email,
        isArchive: false,
        isDeleted: false
    });
    if (!company) {
        req.flash('error', [i18n.__('email_not_exist')]);
        return res.redirect('/company/forgot-password');
    }
    const remember_token = new TokenGenerator(256, TokenGenerator.BASE62).generate();
    var buildUrl = req.protocol + '://' + req.get('host') + `/company/create-password/${remember_token}/${company._id}`;
    await Company.findByIdAndUpdate(company._id, { remember_token: remember_token }, { new: true });

    let options = {
        'name': company.name,
        'buildUrl': buildUrl
    };
    sendEmail(company.email, 'forgot-password', options, i18n.__('password_recovery_subject'));

    req.flash('success', [i18n.__('password_recovery_instruction')]);
    return res.redirect('/company/forgot-password');
});

router.get('/create-password/:remember_token/:id', companyAuth, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        req.flash('error', [i18n.__('password_recovery_link_expired')]);
        return res.redirect('/company/forgot-password');
    }

    let company = await Company.findOne({ 
        remember_token: req.params.remember_token, 
        _id: req.params.id,
        isArchive: false,
        isDeleted: false
    });
    if (!company) {
        req.flash('error', [i18n.__('password_recovery_link_expired')]);
        return res.redirect('/company/forgot-password');
    }

    res.render('company/create-password', {
        layout: "company/include/loginLayout",
        title: i18n.__('create_password'),
    });
});

router.post('/create-password/:remember_token/:id', companyAuth, async (req, res) => {
    const { error } = validateUpdatePassword(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect(`/company/create-password/${req.params.remember_token}/${req.params.id}`);
    }

    let company = await Company.findOne({ 
        remember_token: req.params.remember_token, 
        _id: req.params.id,
        isArchive: false,
        isDeleted: false
    });
    if (!company) {
        req.flash('error', [i18n.__('password_recovery_link_expired')]);
        return res.redirect('/company/forgot-password');
    }
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);

    await Company.findByIdAndUpdate(company._id, { remember_token: null, password: password }, { new: true });

    let options = {
        'name': company.name,
    };
    sendEmail(company.email, 'create-password', options, i18n.__('password_changed_subject'));

    req.flash('success', [i18n.__('password_changed')]);
    return res.redirect('/company/login');
});


module.exports = router; 
