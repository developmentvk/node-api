const express = require('express');
const adminSession = require('../../middleware/adminSession');
const rbac = require('../../middleware/rbac');
const i18n = require("i18n");
const { Modules, validate } = require('../../models/modules');
const { successMessage, errorMessage } = require('../../helpers/MyHelper');
const _ = require('lodash');
const router = express.Router();

router.get('/modules', [adminSession, rbac], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    res.render('admin/modules/index', {
        layout: "admin/include/layout",
        title: i18n.__('all_modules'),
        error: error,
        success: success
    });
});

router.post('/modules/listings', [adminSession, rbac], async (req, res) => {
    Modules.dataTables({
        limit: req.body.length,
        skip: req.body.start,
        order: req.body.order,
        columns: req.body.columns,
        search: {
            value: req.body.search.value,
            fields: ['name', 'en_name', 'action_path']
        },
    }).then(function (table) {
        res.json({
            data: table.data,
            recordsFiltered: table.total,
            recordsTotal: table.total
        });
    });
});


router.get('/modules/create', [adminSession, rbac], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    const moduleMasters = await Modules.find({ parent_id: null });
    res.render('admin/modules/create', {
        layout: "admin/include/layout",
        title: i18n.__('create_module'),
        error: error,
        success: success,
        moduleMasters: moduleMasters
    });
});

router.post('/modules/create', [adminSession, rbac], async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect(`/admin/modules/create`);
    }
    const modules = new Modules({
        name: req.body.name,
        en_name: req.body.en_name,
        icon: req.body.icon,
        parent_id: req.body.parent_id ? req.body.parent_id : null,
        action_path: req.body.action_path,
        status: req.body.status,
        show_in_menu: req.body.show_in_menu,
        show_in_permission: req.body.show_in_permission,
        display_order: req.body.display_order
    })
    await modules.save();
    req.flash('success', [i18n.__('module_saved_successfully')]);
    return res.redirect('/admin/modules/create');
});


router.get('/modules/update/:id', [adminSession, rbac], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    const modules = await Modules.findOne({
        _id: req.params.id
    });
    if (!modules) {
        req.flash('error', [i18n.__('record_not_found')]);
        return res.redirect('/admin/modules');
    }
    const moduleMasters = await Modules.find({
        parent_id: null,
        _id: { $ne: req.params.id }
    });
    res.render('admin/modules/update', {
        layout: "admin/include/layout",
        title: i18n.__('update_module'),
        error: error,
        success: success,
        modules: modules,
        moduleMasters: moduleMasters
    });
});

router.post('/modules/update/:id', [adminSession, rbac], async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        res.redirect(`/admin/modules/update/${req.params.id}`);
    }
    await Modules.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        en_name: req.body.en_name,
        icon: req.body.icon,
        parent_id: req.body.parent_id ? req.body.parent_id : null,
        action_path: req.body.action_path,
        status: req.body.status,
        show_in_menu: req.body.show_in_menu,
        show_in_permission: req.body.show_in_permission,
        display_order: req.body.display_order
    }, { new: true });
    req.flash('success', [i18n.__('module_updated_successfully')]);
    return res.redirect(`/admin/modules/update/${req.params.id}`);
});


router.post('/modules/delete/:id', [adminSession, rbac], async (req, res) => {
    const modules = await Modules.findByIdAndRemove(req.params.id);
    if (!modules) return errorMessage(res, 'no_record_found');
    return successMessage(res, 'success', 200, Modules);
});
module.exports = router; 
