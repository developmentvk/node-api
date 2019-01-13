const express = require('express');
const adminSession = require('../../middleware/adminSession');
const rbac = require('../../middleware/rbac');
const i18n = require("i18n");
const { Company, validate, validateUpdate, validateUpdatePassword } = require('../../models/company');
const { CompanyLoginLogs } = require('../../models/companyLoginLogs');
const { successMessage, errorMessage } = require('../../helpers/MyHelper');
const { Industry } = require('../../models/industry');
const { Countries } = require('../../models/countries');
const { Sessions } = require('../../models/sessions');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const router = express.Router();

router.get('/company', [adminSession, rbac], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');

    res.render('admin/company/index', {
        layout: "admin/include/layout",
        title: i18n.__('all_companies'),
        error: error,
        success: success
    });
});

router.post('/company/listings', [adminSession, rbac], async (req, res) => {
    Company.dataTables({
        limit: req.body.length,
        skip: req.body.start,
        order: req.body.order,
        columns: req.body.columns,
        search: {
            value: req.body.search.value,
            fields: ['name', 'en_name', 'website_url', 'dial_code', 'mobile', 'email']
        },
    }).then(function (table) {
        res.json({
            data: table.data,
            recordsFiltered: table.total,
            recordsTotal: table.total
        });
    });
});


router.get('/company/create', [adminSession, rbac], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    const industry = await Industry.find({ status: 1 });
    const countries = await Countries.find();

    res.render('admin/company/create', {
        layout: "admin/include/layout",
        title: i18n.__('create_company'),
        industry: industry,
        countries: countries,
        error: error,
        success: success
    });
});

router.post('/company/create', [adminSession, rbac], async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect(`/admin/company/create`);
    }
    let company = await Company.findOne({ email: req.body.email });
    if (company) {
        req.flash('error', [i18n.__('company_account_already_registered')]);
        return res.redirect(`/admin/company/create`);
    }

    let fields = ['name', 'en_name', 'website_url', 'dial_code', 'mobile', 'email', 'password', 'industry_id', 'number_of_employees', 'logo', 'audience', 'chat_purpose', 'status'];
    if (req.body.logo) {
        fields.push('logo');
    }
    company = new Company(_.pick(req.body, fields));
    const salt = await bcrypt.genSalt(10);
    company.password = await bcrypt.hash(company.password, salt);
    await company.save();

    req.flash('success', [i18n.__('company_saved_successfully')]);
    return res.redirect('/admin/company/create');
});

router.get('/company/update/:id', [adminSession, rbac], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    const company = await Company.findOne({
        _id: req.params.id
    });
    if (!company) {
        req.flash('error', [i18n.__('record_not_found')]);
        return res.redirect('/admin/company');
    }
    company.audience = _.toArray(company.audience);
    company.chat_purpose = _.toArray(company.chat_purpose);

    const industry = await Industry.find({ status: 1 });
    const countries = await Countries.find();
    res.render('admin/company/update', {
        layout: "admin/include/layout",
        title: i18n.__('update_company'),
        error: error,
        success: success,
        company: company,
        industry: industry,
        countries: countries
    });
});

router.post('/company/update/:id', [adminSession, rbac], async (req, res) => {
    const { error } = validateUpdate(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        res.redirect(`/admin/company/update/${req.params.id}`);
    }

    let company = await Company.findOne({
        _id: { $ne: req.params.id },
        email: req.body.email
    });
    if (company) {
        req.flash('error', [i18n.__('company_account_already_registered')]);
        res.redirect(`/admin/company/update/${req.params.id}`);
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
        chat_purpose: req.body.chat_purpose,
        status: req.body.status
    };
    if (req.body.logo) {
        fields.logo = req.body.logo;
    }
    await Company.findByIdAndUpdate(req.params.id, fields, { new: true });

    req.flash('success', [i18n.__('company_updated_successfully')]);
    return res.redirect(`/admin/company/update/${req.params.id}`);
});

router.post('/company/delete/:id', [adminSession, rbac], async (req, res) => {
    const company = await Company.findByIdAndRemove(req.params.id);
    if (!company) return errorMessage(res, 'no_record_found');
    return successMessage(res, 'success', 200, company);
});

router.get('/company/view/:id', [adminSession, rbac], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    const company = await Company.findOne({
        _id: req.params.id
    }).populate({
        path: 'industry_id',
        select: ['name', 'en_name']
    });
    if (!company) {
        req.flash('error', [i18n.__('record_not_found')]);
        return res.redirect('/admin/company');
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

    res.render('admin/company/view', {
        layout: "admin/include/layout",
        title: i18n.__('view_details'),
        error: error,
        success: success,
        data: company,
        companyLoginLogs: companyLoginLogs
    });
});


router.post('/company/end-session/:id', [adminSession], async (req, res) => {
    let companyLoginLogsExists = await CompanyLoginLogs.find({
        company_id: req.params.id,
        isActive: true
    }).exec();
    if (companyLoginLogsExists.length > 0) {
        _.forEach(companyLoginLogsExists, async function (value) {
            await Sessions.deleteOne({ "session.company.login_id": value._id });
            await CompanyLoginLogs.findByIdAndUpdate(value._id, {
                logout_at: new Date(),
                isActive: false
            }, { new: true });

            req.app.io.emit("logoutCompanySessionEvent", {
                company_id: value.company_id,
                action: 'terminated'
            });
        })
    }

    return successMessage(res, 'success', 200);
});

router.post('/company/access-log/listings/:company_id', [adminSession], async (req, res) => {
    CompanyLoginLogs.dataTables({
        limit: req.body.length,
        skip: req.body.start,
        order: req.body.order,
        columns: req.body.columns,
        find: {
            company_id: req.params.company_id,
            isActive: false
        },
        search: {
            value: req.body.search.value,
            fields: ['ip_address', 'browser', 'session_id']
        }
    }).then(function (table) {
        res.json({
            data: table.data,
            recordsFiltered: table.total,
            recordsTotal: table.total
        });
    });
});

router.post('/company/access-log/delete/:id', [adminSession, rbac], async (req, res) => {
    const companyLoginLogs = await CompanyLoginLogs.findByIdAndRemove(req.params.id);
    if (!companyLoginLogs) return errorMessage(res, 'no_record_found');
    return successMessage(res, 'success', 200, companyLoginLogs);
});

router.get('/company/change/password/:id', [adminSession, rbac], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');

    res.render('admin/company/update_password', {
        layout: "admin/include/layout",
        title: i18n.__('change_password'),
        error: error,
        success: success
    });
});

router.post('/company/change/password/:id', [adminSession, rbac], async (req, res) => {
    const { error } = validateUpdatePassword(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect(`/admin/company/change/password/${req.params.id}`);
    }

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);

    await Company.findByIdAndUpdate(req.params.id, { password: password }, { new: true });

    req.flash('success', [i18n.__('account_password_updated_successfully')]);
    return res.redirect(`/admin/company/change/password/${req.params.id}`);
});


module.exports = router; 
