const express = require('express');
const companySession = require('../../middleware/companySession');
const crbac = require('../../middleware/crbac');
const i18n = require("i18n");
const { Company, validateUpdateAccount, validateUpdateAccountPassword, validateUpdatePassword } = require('../../models/company');
const { Industry } = require('../../models/industry');
const { Countries } = require('../../models/countries');
const { CompanyLoginLogs } = require('../../models/companyLoginLogs');
const { uploadFile, successMessage, errorMessage } = require('../../helpers/MyHelper');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const router = express.Router();

router.get('/account-info', [companySession], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    const company = await Company.findOne({
        _id: req.session.company._id,
        isArchive: false,
        isDeleted: false
    }).populate({
        path: 'industry_id',
        select: ['name', 'en_name']
    }).populate({
        path: 'subscription_plan_id',
        select: ['name', 'en_name']
    });
    if (!company) {
        req.flash('error', [i18n.__('no_record_found')]);
        return res.redirect('/company/logout');
    }
    company.decoded_status = i18n.__('account_status_array')[company.status];

    const companyLoginLogs = await CompanyLoginLogs.findOne({
        company_id: company._id,
        isActive: true
    });

    res.render('company/company/account_info', {
        layout: "company/include/layout",
        title: i18n.__('account_info'),
        error: error,
        success: success,
        data: company,
        companyLoginLogs: companyLoginLogs
    });
});

router.get('/update/account', [companySession], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    const company = await Company.findOne({
        _id: req.session.company._id,
        isArchive: false,
        isDeleted: false
    });
    if (!company) {
        req.flash('error', [i18n.__('no_record_found')]);
        return res.redirect('/company/logout');
    }

    const industry = await Industry.find({
        status: 1,
        isArchive: false,
        isDeleted: false
    });
    const countries = await Countries.find({
        isArchive: false,
        isDeleted: false
    });

    res.render('company/company/update_account', {
        layout: "company/include/layout",
        title: i18n.__('update_account'),
        error: error,
        success: success,
        company: company,
        industry: industry,
        countries: countries
    });
});

router.post('/update/account', [companySession], async (req, res) => {
    const { error } = validateUpdateAccount(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect(`/company/update/account`);
    }
    let company = await Company.findOne({
        _id: { $ne: req.session.company._id },
        email: req.body.email,
        isArchive: false,
        isDeleted: false
    });
    if (company) {
        req.flash('error', [i18n.__('company_account_already_registered')]);
        return res.redirect(`/company/update/account`);
    }
    let fields = {
        name: req.body.name,
        email: req.body.email,
        dial_code: req.body.dial_code,
        mobile: req.body.mobile,
    };
    if (req.body.image) {
        fields.image = req.body.image;
    }
    await Company.findByIdAndUpdate(req.session.company._id, fields, { new: true });

    req.flash('success', [i18n.__('account_updated_successfully')]);
    return res.redirect(`/company/update/account`);
});

router.get('/change/password', [companySession], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');

    res.render('company/company/change_password', {
        layout: "company/include/layout",
        title: i18n.__('change_password'),
        error: error,
        success: success
    });
});


router.post('/change/password', [companySession], async (req, res) => {
    const { error } = validateUpdateAccountPassword(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect(`/company/change/password`);
    }
    let company = await Company.findOne({
        _id: req.session.company._id,
        isArchive: false,
        isDeleted: false
    });
    if (!company) {
        req.flash('error', [i18n.__('no_record_found')]);
        return res.redirect('/company/logout');
    }
    const validPassword = await bcrypt.compare(req.body.old_password, company.password);
    if (!validPassword) {
        req.flash('error', [i18n.__('invalid_old_password')]);
        return res.redirect(`/company/change/password`);
    }

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);

    await Company.findByIdAndUpdate(req.session.company._id, { password: password }, { new: true });

    req.flash('success', [i18n.__('password_updated_successfully')]);
    return res.redirect(`/company/change/password`);
});

router.post('/set-locale', async (req, res) => {
    let locale = req.body.locale == 'en' ? 'ar' : 'en';
    req.session.locale = locale;
    res.cookie('locale', locale);
    return successMessage(res, 'success', 200);
});

router.get('/company/change/password/:id', [companySession, crbac], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');

    res.render('company/company/update_password', {
        layout: "company/include/layout",
        title: i18n.__('change_password'),
        error: error,
        success: success
    });
});

router.post('/company/change/password/:id', [companySession, crbac], async (req, res) => {
    const { error } = validateUpdatePassword(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect(`/company/company/change/password/${req.params.id}`);
    }

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);

    await Company.findByIdAndUpdate(req.params.id, { password: password }, { new: true });

    req.flash('success', [i18n.__('account_password_updated_successfully')]);
    return res.redirect(`/company/company/change/password/${req.params.id}`);
});

router.post('/company/upload', async (req, res) => {
    try {
        let file = await uploadFile(req, res, 'file', 'images');
        return successMessage(res, 'success', 200, { 'file': file });
    } catch (err) {
        errorMessage(res, err);
    }
});

module.exports = router; 
