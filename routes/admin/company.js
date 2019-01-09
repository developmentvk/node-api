const express = require('express');
const adminSession = require('../../middleware/adminSession');
const rbac = require('../../middleware/rbac');
const i18n = require("i18n");
const { Company, validate } = require('../../models/company');
const { successMessage, errorMessage } = require('../../helpers/MyHelper');
const { matchedData } = require('express-validator/filter');
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
            fields: ['name', 'en_name']
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
    res.render('admin/company/create', {
        layout: "admin/include/layout",
        title: i18n.__('create_company'),
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
    const company = new Company({
        name: req.body.name,
        en_name: req.body.en_name,
        status: req.body.status
    })
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
    res.render('admin/company/update', {
        layout: "admin/include/layout",
        title: i18n.__('update_company'),
        error: error,
        success: success,
        company: company
    });
});

router.post('/company/update/:id', [adminSession, rbac], async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        res.redirect(`/admin/company/update/${req.params.id}`);
    }

    await Company.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        en_name: req.body.en_name,
        status: req.body.status,
    }, { new: true });

    req.flash('success', [i18n.__('company_updated_successfully')]);
    return res.redirect(`/admin/company/update/${req.params.id}`);
});

router.post('/company/delete/:id', [adminSession, rbac], async (req, res) => {
    const company = await Company.findByIdAndRemove(req.params.id);
    if (!company) return errorMessage(res, 'no_record_found');
    return successMessage(res, 'success', 200, company);
});

module.exports = router; 
