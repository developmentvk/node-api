const express = require('express');
const adminSession = require('../../middleware/adminSession');
const i18n = require("i18n");
const { NavigationsMasters, validate } = require('../../models/navigationsMasters');
const { successMessage, errorMessage } = require('../../helpers/SocketHelper');
const _ = require('lodash');
const router = express.Router();

router.get('/navigations', adminSession, async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');

    res.render('admin/navigations/index', {
        layout: "admin/include/layout",
        title: i18n.__('navigations'),
        error: error,
        success: success
    });
});

router.post('/navigations/listings', adminSession, async (req, res) => {
    NavigationsMasters.dataTables({
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

router.get('/navigations/update/:id', adminSession, async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    const navigations = await NavigationsMasters.findOne({
        _id:req.params.id
    });
    if (!navigations) {
        req.flash('error', [i18n.__('record_not_found')]);
        return res.redirect('/admin/navigations');
    }

    const navigationsMasters = await NavigationsMasters.find({
        parent_id:null,
        _id: { $ne: req.params.id }
    });
    res.render('admin/navigations/update', {
        layout: "admin/include/layout",
        title: i18n.__('update_navigation'),
        error: error,
        success: success,
        navigations : navigations,
        navigationsMasters : navigationsMasters
    });
});

router.post('/navigations/update/:id', adminSession, async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        res.redirect(`/admin/navigations/update/${req.params.id}`);
    }

    await NavigationsMasters.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        en_name: req.body.en_name,
        icon: req.body.icon,
        parent_id: req.body.parent_id ? req.body.parent_id : null,
        action_path: req.body.action_path,
        status: req.body.status,
        show_in_menu: req.body.show_in_menu,
        show_in_permission: req.body.show_in_permission,
        child_permission: req.body.child_permission,
        display_order: req.body.display_order
    }, { new: true });

    req.flash('success', [i18n.__('navigation_menu_updated_successfully')]);
    return res.redirect(`/admin/navigations/update/${req.params.id}`);
});

router.get('/navigations/create', adminSession, async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    const navigationsMasters = await NavigationsMasters.find({parent_id:null});
    res.render('admin/navigations/create', {
        layout: "admin/include/layout",
        title: i18n.__('create_navigation'),
        error: error,
        success: success,
        navigationsMasters : navigationsMasters
    });
});

router.post('/navigations/create', adminSession, async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect(`/admin/navigations/create`);
    }
    const navigationsMasters = new NavigationsMasters({
        name: req.body.name,
        en_name: req.body.en_name,
        icon: req.body.icon,
        parent_id: req.body.parent_id ? req.body.parent_id : null,
        action_path: req.body.action_path,
        status: req.body.status,
        show_in_menu: req.body.show_in_menu,
        show_in_permission: req.body.show_in_permission,
        child_permission: req.body.child_permission,
        display_order: req.body.display_order
    })
    await navigationsMasters.save();
    req.flash('success', [i18n.__('navigation_menu_saved_successfully')]);
    return res.redirect('/admin/navigations/create');
});


router.post('/navigations/delete/:id', adminSession, async (req, res) => {
    const navigationsMasters = await NavigationsMasters.findByIdAndRemove(req.params.id);
	if (!navigationsMasters) return errorMessage(res, 'no_record_found');
	return successMessage(res, 'success', 200, navigationsMasters);
});
module.exports = router; 
