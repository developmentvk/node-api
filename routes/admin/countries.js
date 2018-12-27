const express = require('express');
const adminSession = require('../../middleware/adminSession');
const rbac = require('../../middleware/rbac');
const i18n = require("i18n");
const { Countries, validate } = require('../../models/countries');
const { successMessage, errorMessage } = require('../../helpers/SocketHelper');
const _ = require('lodash');
const router = express.Router();

router.get('/countries', [adminSession, rbac], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');

    res.render('admin/countries/index', {
        layout: "admin/include/layout",
        title: i18n.__('countries'),
        error: error,
        success: success
    });
});

router.post('/countries/listings', [adminSession, rbac], async (req, res) => {
    Countries.dataTables({
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


router.get('/countries/create', [adminSession, rbac], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    res.render('admin/countries/create', {
        layout: "admin/include/layout",
        title: i18n.__('create_country'),
        error: error,
        success: success
    });
});

router.post('/countries/create', [adminSession, rbac], async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect(`/admin/countries/create`);
    }
    const countries = new Countries({
        name: req.body.name,
        en_name: req.body.en_name,
        iso_code: req.body.iso_code,
        dial_code: req.body.dial_code,
        status: req.body.status
    })
    await countries.save();
    req.flash('success', [i18n.__('country_saved_successfully')]);
    return res.redirect('/admin/countries/create');
});

router.get('/countries/update/:id', [adminSession, rbac], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    const countries = await Countries.findOne({
        _id:req.params.id
    });
    if (!countries) {
        req.flash('error', [i18n.__('record_not_found')]);
        return res.redirect('/admin/countries');
    }
    res.render('admin/countries/update', {
        layout: "admin/include/layout",
        title: i18n.__('update_country'),
        error: error,
        success: success,
        countries : countries
    });
});

router.post('/countries/update/:id', [adminSession, rbac], async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        res.redirect(`/admin/countries/update/${req.params.id}`);
    }

    await Countries.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        en_name: req.body.en_name,
        iso_code: req.body.iso_code,
        dial_code: req.body.dial_code,
        status: req.body.status
    }, { new: true });

    req.flash('success', [i18n.__('country_updated_successfully')]);
    return res.redirect(`/admin/countries/update/${req.params.id}`);
});



router.post('/countries/delete/:id', [adminSession, rbac], async (req, res) => {
    const countries = await Countries.findByIdAndRemove(req.params.id);
	if (!countries) return errorMessage(res, 'no_record_found');
	return successMessage(res, 'success', 200, countries);
});
module.exports = router; 
