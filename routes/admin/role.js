const express = require('express');
const adminSession = require('../../middleware/adminSession');
const rbac = require('../../middleware/rbac');
const i18n = require("i18n");
const { UsersRoles, validate } = require('../../models/usersRoles');
const { RolesPermissions } = require('../../models/rolesPermissions');
const { successMessage, errorMessage, getGroupNavigation, getRolePermission } = require('../../helpers/MyHelper');
const _ = require('lodash');
const router = express.Router();

router.get('/roles', [adminSession, rbac], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');

    res.render('admin/roles/index', {
        layout: "admin/include/layout",
        title: i18n.__('roles'),
        error: error,
        success: success
    });
});

router.post('/roles/listings', [adminSession, rbac], async (req, res) => {
    UsersRoles.dataTables({
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


router.get('/roles/create', [adminSession, rbac], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    res.render('admin/roles/create', {
        layout: "admin/include/layout",
        title: i18n.__('create_role'),
        error: error,
        success: success
    });
});

router.post('/roles/create', [adminSession, rbac], async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect(`/admin/roles/create`);
    }
    const usersRoles = new UsersRoles({
        name: req.body.name,
        en_name: req.body.en_name,
        status: req.body.status
    })
    await usersRoles.save();
    req.flash('success', [i18n.__('role_saved_successfully')]);
    return res.redirect('/admin/roles/create');
});

router.get('/roles/update/:id', [adminSession, rbac], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    const roles = await UsersRoles.findOne({
        _id: req.params.id
    });
    if (!roles) {
        req.flash('error', [i18n.__('record_not_found')]);
        return res.redirect('/admin/roles');
    }
    res.render('admin/roles/update', {
        layout: "admin/include/layout",
        title: i18n.__('update_role'),
        error: error,
        success: success,
        roles: roles
    });
});

router.post('/roles/update/:id', [adminSession, rbac], async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        res.redirect(`/admin/roles/update/${req.params.id}`);
    }

    await UsersRoles.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        en_name: req.body.en_name,
        status: req.body.status,
    }, { new: true });

    req.flash('success', [i18n.__('role_updated_successfully')]);
    return res.redirect(`/admin/roles/update/${req.params.id}`);
});

router.post('/roles/delete/:id', [adminSession, rbac], async (req, res) => {
    const usersRoles = await UsersRoles.findByIdAndRemove(req.params.id);
    if (!usersRoles) return errorMessage(res, 'no_record_found');
    return successMessage(res, 'success', 200, usersRoles);
});

router.get('/roles/permission/:id', [adminSession, rbac], async (req, res) => {
    if (!req.params.id) {
        req.flash('error', [i18n.__('record_not_found')]);
        return res.redirect('/admin/roles');
    }

    let error = req.flash('error');
    let success = req.flash('success');
    let navigations = await getGroupNavigation();
    let rolePermissions = await getRolePermission(req.params.id);
    res.render('admin/roles/permission', {
        layout: "admin/include/layout",
        title: i18n.__('role_permission'),
        error: error,
        success: success,
        navigations: navigations,
        rolePermissions: rolePermissions
    });
});

router.post('/roles/permission/:id', [adminSession, rbac], async (req, res) => {
    if (!req.params.id) {
        req.flash('error', [i18n.__('record_not_found')]);
        return res.redirect(`/admin/roles/permission/${req.params.id}`);
    }

    RolesPermissions.deleteMany({ role_id: req.params.id }).exec();

    if (req.body.hasOwnProperty('navigation_id')) {
        _.forEach(req.body.navigation_id, function (navigation_id) {
            const rolesPermissions = new RolesPermissions({
                role_id: req.params.id,
                navigation_id: navigation_id
            })
            rolesPermissions.save();
        });
    }

    req.flash('success', [i18n.__('role_permission_updated_successfully')]);
    return res.redirect(`/admin/roles/permission/${req.params.id}`);
});

module.exports = router; 
