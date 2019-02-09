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
    let audienceArr = new Array();
    audience = _.toArray(company.audience);
    if (audience.length > 0) {
        _.forEach(audience, function (value) {
            if (value != ',') {
                audienceArr.push(i18n.__('audience_array')[value]);
            }
        });
    }
    company.decoded_audience = audienceArr.length > 0 ? audienceArr.join(', ') : '';

    let chat_purposeArr = new Array();
    chat_purpose = _.toArray(company.chat_purpose);
    if (chat_purpose.length > 0) {
        _.forEach(chat_purpose, function (value) {
            if (value != ',') {
                chat_purposeArr.push(i18n.__('chat_purpose_array')[value]);
            }
        })
    }
    company.decoded_chat_purpose = chat_purposeArr.length > 0 ? chat_purposeArr.join(', ') : '';

    company.decoded_status = i18n.__('account_status_array')[company.status];
    company.decoded_number_of_employees = i18n.__('number_of_employees_array')[company.number_of_employees];

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

    company.audience = _.toArray(company.audience);
    company.chat_purpose = _.toArray(company.chat_purpose);

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
        en_name: req.body.en_name,
        website_url: req.body.website_url,
        dial_code: req.body.dial_code,
        mobile: req.body.mobile,
        email: req.body.email,
        industry_id: req.body.industry_id,
        number_of_employees: req.body.number_of_employees,
        audience: req.body.audience,
        chat_purpose: req.body.chat_purpose
    };
    if (req.body.logo) {
        fields.logo = req.body.logo;
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
