const express = require('express');
const adminSession = require('../../middleware/adminSession');
const rbac = require('../../middleware/rbac');
const i18n = require("i18n");
const { Industry, validate } = require('../../models/industry');
const { successMessage, errorMessage } = require('../../helpers/MyHelper');
const router = express.Router();

router.get('/industry', [adminSession, rbac], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');

    res.render('admin/industry/index', {
        layout: "admin/include/layout",
        title: i18n.__('industry'),
        error: error,
        success: success
    });
});

router.post('/industry/listings', [adminSession, rbac], async (req, res) => {
    Industry.dataTables({
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


router.get('/industry/create', [adminSession, rbac], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    res.render('admin/industry/create', {
        layout: "admin/include/layout",
        title: i18n.__('create_industry'),
        error: error,
        success: success
    });
});

router.post('/industry/create', [adminSession, rbac], async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect(`/admin/industry/create`);
    }
    const industry = new Industry({
        name: req.body.name,
        en_name: req.body.en_name,
        status: req.body.status
    })
    await industry.save();
    req.flash('success', [i18n.__('industry_saved_successfully')]);
    return res.redirect('/admin/industry/create');
});

router.get('/industry/update/:id', [adminSession, rbac], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    const industry = await Industry.findOne({
        _id: req.params.id
    });
    if (!industry) {
        req.flash('error', [i18n.__('record_not_found')]);
        return res.redirect('/admin/industry');
    }
    res.render('admin/industry/update', {
        layout: "admin/include/layout",
        title: i18n.__('update_industry'),
        error: error,
        success: success,
        industry: industry
    });
});

router.post('/industry/update/:id', [adminSession, rbac], async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        res.redirect(`/admin/industry/update/${req.params.id}`);
    }

    await Industry.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        en_name: req.body.en_name,
        status: req.body.status,
    }, { new: true });

    req.flash('success', [i18n.__('industry_updated_successfully')]);
    return res.redirect(`/admin/industry/update/${req.params.id}`);
});

router.post('/industry/delete/:id', [adminSession, rbac], async (req, res) => {
    const industry = await Industry.findByIdAndUpdate(req.params.id, {isArchive : true}, { new: true });
    if (!industry) return errorMessage(res, 'no_record_found');
    return successMessage(res, 'success', 200, industry);
});

module.exports = router; 
