const express = require('express');
const adminSession = require('../../middleware/adminSession');
const rbac = require('../../middleware/rbac');
const i18n = require("i18n");
const { Admin, validate, validateUpdate } = require('../../models/admin');
const { UsersRoles } = require('../../models/usersRoles');
const { Countries } = require('../../models/countries');
const { UsersPermissions } = require('../../models/usersPermissions');
const { successMessage, errorMessage, getGroupNavigation, getUsersPermission } = require('../../helpers/SocketHelper');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const router = express.Router();

router.get('/admins', [adminSession, rbac], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    res.render('admin/admins/index', {
        layout: "admin/include/layout",
        title: i18n.__('admins'),
        error: error,
        success: success
    });
});

router.post('/admins/listings',[adminSession, rbac], async (req, res) => {
    Admin.dataTables({
        limit: req.body.length,
        skip: req.body.start,
        order: req.body.order,
        columns: req.body.columns,
        search: {
            value: req.body.search.value,
            fields: ['name', 'email', 'mobile']
        },
        populate: ({
            path: 'role_id',
            select: ['name', 'en_name']
        }),
        formatter: function(modifiedRecords) {
            return modifiedRecords;
        }
    }).then(function (table) {
        res.json({
            data: table.data,
            recordsFiltered: table.total,
            recordsTotal: table.total
        });
    });
});


router.get('/admins/view/:id', [adminSession, rbac], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    const admins = await Admin.findOne({
        _id: req.params.id
    });
    if (!admins) {
        req.flash('error', [i18n.__('record_not_found')]);
        return res.redirect('/admin/admins');
    }
    res.render('admin/admins/view', {
        layout: "admin/include/layout",
        title: i18n.__('view_details'),
        error: error,
        success: success,
        data : admins
    });
});

router.get('/admins/create',[adminSession, rbac], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    const usersRoles = await UsersRoles.find();
    const countries = await Countries.find();

    res.render('admin/admins/create', {
        layout: "admin/include/layout",
        title: i18n.__('create_admin'),
        error: error,
        success: success,
        usersRoles: usersRoles,
        countries: countries
    });
});

router.post('/admins/create',[adminSession, rbac], async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        res.redirect(`/admin/admins/create`);
    }

    let admin = await Admin.findOne({ email: req.body.email });
    if (admin) {
        req.flash('error', [i18n.__('admin_account_already_registered')]);
        res.redirect(`/admin/admins/create`);
    }

    admin = new Admin(_.pick(req.body, ['name', 'email', 'dial_code', 'mobile', 'role_id', 'password', 'status']));
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(admin.password, salt);
    await admin.save();

    // await uploadFile(req, res, 'image', 'images', function(err, message) {
    //     console.log(err);
    //     console.log(message);
    // });

    req.flash('success', [i18n.__('admin_account_created_successfully')]);
    return res.redirect('/admin/admins/create');
});


router.get('/admins/update/:id',[adminSession, rbac], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    const admins = await Admin.findOne({
        _id: req.params.id
    });
    if (!admins) {
        req.flash('error', [i18n.__('record_not_found')]);
        return res.redirect('/admin/admins');
    }

    const usersRoles = await UsersRoles.find();
    const countries = await Countries.find();

    res.render('admin/admins/update', {
        layout: "admin/include/layout",
        title: i18n.__('update_admin'),
        error: error,
        success: success,
        admins: admins,
        usersRoles: usersRoles,
        countries: countries
    });
});

router.post('/admins/update/:id',[adminSession, rbac], async (req, res) => {
    const { error } = validateUpdate(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        res.redirect(`/admin/admins/update/${req.params.id}`);
    }
    let admin = await Admin.findOne({ 
        _id : { $ne : req.params.id },
        email: req.body.email 
    });
    if (admin) {
        req.flash('error', [i18n.__('admin_account_already_registered')]);
        res.redirect(`/admin/admins/create`);
    }

    await Admin.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        email: req.body.email,
        dial_code: req.body.dial_code,
        mobile: req.body.mobile,
        role_id: req.body.role_id,
        status: req.body.status
    }, { new: true });

    req.flash('success', [i18n.__('admin_account_updated_successfully')]);
    return res.redirect(`/admin/admins/update/${req.params.id}`);
});


router.post('/admins/delete/:id',[adminSession, rbac], async (req, res) => {
    const admin = await Admin.findByIdAndRemove(req.params.id);
    if (!admin) return errorMessage(res, 'no_record_found');
    return successMessage(res, 'success', 200, admin);
});


router.get('/admins/permission/:id',[adminSession, rbac], async (req, res) => {
    if (!req.params.id) {
        req.flash('error', [i18n.__('record_not_found')]);
        return res.redirect('/admin/admins');
    }

    let error = req.flash('error');
    let success = req.flash('success');
    let navigations = await getGroupNavigation();
    let userPermissions = await getUsersPermission(req.params.id);
    res.render('admin/admins/permission', {
        layout: "admin/include/layout",
        title: i18n.__('account_permission'),
        error: error,
        success: success,
        navigations: navigations,
        userPermissions: userPermissions
    });
});

router.post('/admins/permission/:id',[adminSession, rbac], async (req, res) => {
    if (!req.params.id) {
        req.flash('error', [i18n.__('record_not_found')]);
        return res.redirect(`/admin/admins/permission/${req.params.id}`);
    }

    UsersPermissions.deleteMany({ admin_id: req.params.id }).exec();

    if (req.body.hasOwnProperty('navigation_id')) {
        _.forEach(req.body.navigation_id, function (navigation_id) {
            const usersPermissions = new UsersPermissions({
                admin_id: req.params.id,
                navigation_id: navigation_id
            })
            usersPermissions.save();
        });
    }

    req.flash('success', [i18n.__('account_permission_updated_successfully')]);
    return res.redirect(`/admin/admins/permission/${req.params.id}`);
});

module.exports = router; 
