const express = require('express');
const adminSession = require('../../middleware/adminSession');
const rbac = require('../../middleware/rbac');
const i18n = require("i18n");
const { Admin, validate, validateUpdate, validateUpdateAccount, validateUpdateAccountPassword,validateUpdatePassword } = require('../../models/admin');
const { UsersRoles } = require('../../models/usersRoles');
const { Countries } = require('../../models/countries');
const { UsersPermissions } = require('../../models/usersPermissions');
const { AdminLoginLogs } = require('../../models/adminLoginLogs');
const { Sessions } = require('../../models/sessions');
const { uploadFile,successMessage, errorMessage, getGroupNavigation, getUsersPermission, navigationMenuListing } = require('../../helpers/SocketHelper');
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

router.get('/account-info', [adminSession], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    const admins = await Admin.findOne({
        _id: req.session.admin._id
    }).populate({
        path: 'role_id',
        select: ['name', 'en_name']
    });
    admins.decoded_status = i18n.__('account_status_array')[admins.status];

    const adminLoginLogs = await AdminLoginLogs.findOne({
        admin_id: admins._id,
        isActive: true
    });

    res.render('admin/admins/account_info', {
        layout: "admin/include/layout",
        title: i18n.__('account_info'),
        error: error,
        success: success,
        data: admins,
        adminLoginLogs : adminLoginLogs
    });
});

router.get('/update/account', [adminSession], async (req, res) => {

    let error = req.flash('error');
    let success = req.flash('success');
    const admins = await Admin.findOne({
        _id: req.session.admin._id
    });

    const usersRoles = await UsersRoles.find();
    const countries = await Countries.find();

    res.render('admin/admins/update_account', {
        layout: "admin/include/layout",
        title: i18n.__('update_account'),
        error: error,
        success: success,
        admins: admins,
        usersRoles: usersRoles,
        countries: countries
    });
});

router.post('/update/account', [adminSession], async (req, res) => {
    const { error } = validateUpdateAccount(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect(`/admin/update/account`);
    }
    let admin = await Admin.findOne({
        _id: { $ne: req.session.admin._id },
        email: req.body.email
    });
    if (admin) {
        req.flash('error', [i18n.__('admin_account_already_registered')]);
        return res.redirect(`/admin/update/account`);
    }
    let fields = {
        name: req.body.name,
        email: req.body.email,
        dial_code: req.body.dial_code,
        mobile: req.body.mobile,
    };
    if(req.body.image)
    {
        fields.image = req.body.image;
    }
    await Admin.findByIdAndUpdate(req.session.admin._id, fields, { new: true });

    req.flash('success', [i18n.__('account_updated_successfully')]);
    return res.redirect(`/admin/update/account`);
});

router.get('/change/password', [adminSession], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');

    res.render('admin/admins/change_password', {
        layout: "admin/include/layout",
        title: i18n.__('change_password'),
        error: error,
        success: success
    });
});

router.post('/change/password', [adminSession], async (req, res) => {
    const { error } = validateUpdateAccountPassword(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect(`/admin/change/password`);
    }
    let admin = await Admin.findOne({
        _id: req.session.admin._id
    });
    const validPassword = await bcrypt.compare(req.body.old_password, admin.password);
    if (!validPassword) {
        req.flash('error', [i18n.__('invalid_old_password')]);
        return res.redirect(`/admin/change/password`);
    }

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);
    
    await Admin.findByIdAndUpdate(req.session.admin._id, { password: password }, { new: true });

    req.flash('success', [i18n.__('password_updated_successfully')]);
    return res.redirect(`/admin/change/password`);
});

router.get('/admins/change/password/:id', [adminSession, rbac], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');

    res.render('admin/admins/update_password', {
        layout: "admin/include/layout",
        title: i18n.__('change_password'),
        error: error,
        success: success
    });
});

router.post('/admins/change/password/:id', [adminSession, rbac], async (req, res) => {
    const { error } = validateUpdatePassword(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect(`/admin/admins/change/password/${req.params.id}`);
    }

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);
    
    await Admin.findByIdAndUpdate(req.params.id, { password: password }, { new: true });

    req.flash('success', [i18n.__('account_password_updated_successfully')]);
    return res.redirect(`/admin/admins/change/password/${req.params.id}`);
});

router.post('/admins/listings', [adminSession, rbac], async (req, res) => {
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
        formatter: function (modifiedRecords) {
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
    }).populate({
        path: 'role_id',
        select: ['name', 'en_name']
    });
    if (!admins) {
        req.flash('error', [i18n.__('record_not_found')]);
        return res.redirect('/admin/admins');
    }
    admins.decoded_status = i18n.__('account_status_array')[admins.status];
    let role_id = admins.role_id != null ? admins.role_id._id : null;
    const navigations = await navigationMenuListing(req, false, admins._id, role_id);

    const adminLoginLogs = await AdminLoginLogs.findOne({
        admin_id: admins._id,
        isActive: true
    });

    res.render('admin/admins/view', {
        layout: "admin/include/layout",
        title: i18n.__('view_details'),
        error: error,
        success: success,
        data: admins,
        navigations: navigations,
        adminLoginLogs : adminLoginLogs
    });
});

router.post('/admins/end-session/:id', [adminSession], async (req, res) => {
    let adminLoginLogsExists = await AdminLoginLogs.find({
        admin_id: req.params.id,
        isActive: true
    }).exec();
    if (adminLoginLogsExists.length > 0) {
        _.forEach(adminLoginLogsExists, async function(value) {
            await Sessions.deleteOne({ "session.admin.login_id": value._id });
            await AdminLoginLogs.findByIdAndUpdate(value._id, {
                logout_at: new Date(),
                isActive: false
            }, { new: true });

            req.app.io.emit("logoutSessionEvent", {
                admin_id : value.admin_id,
                action : 'terminated'
            });
        })
    }

    return successMessage(res, 'success', 200);
});

router.post('/admins/access-log/listings/:admin_id', [adminSession], async (req, res) => {
    AdminLoginLogs.dataTables({
        limit: req.body.length,
        skip: req.body.start,
        order: req.body.order,
        columns: req.body.columns,
        find: {
            admin_id : req.params.admin_id,
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

router.post('/admins/access-log/delete/:id', [adminSession, rbac], async (req, res) => {
    const adminLoginLogs = await AdminLoginLogs.findByIdAndRemove(req.params.id);
    if (!adminLoginLogs) return errorMessage(res, 'no_record_found');
    return successMessage(res, 'success', 200, adminLoginLogs);
});

router.get('/admins/create', [adminSession, rbac], async (req, res) => {
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

router.post('/admins/upload', [adminSession], async (req, res) => {
    await uploadFile(req, res, 'file', 'images', function(err, file) {
        if(err) return errorMessage(res, err, true);
        return successMessage(res, 'success', 200, {'file' : file});
    });
});

router.post('/admins/create', [adminSession, rbac], async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect(`/admin/admins/create`);
    }

    let admin = await Admin.findOne({ email: req.body.email });
    if (admin) {
        req.flash('error', [i18n.__('admin_account_already_registered')]);
        return res.redirect(`/admin/admins/create`);
    }

    let fields = ['name', 'email', 'dial_code', 'mobile', 'role_id', 'password', 'status'];
    if(req.body.image)
    {
        fields.push('image');
    }
    admin = new Admin(_.pick(req.body, fields));
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(admin.password, salt);
    await admin.save();

    req.flash('success', [i18n.__('admin_account_created_successfully')]);
    return res.redirect('/admin/admins/create');
});

router.get('/admins/update/:id', [adminSession, rbac], async (req, res) => {
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

router.post('/admins/update/:id', [adminSession, rbac], async (req, res) => {
    const { error } = validateUpdate(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect(`/admin/admins/update/${req.params.id}`);
    }
    let admin = await Admin.findOne({
        _id: { $ne: req.params.id },
        email: req.body.email
    });
    if (admin) {
        req.flash('error', [i18n.__('admin_account_already_registered')]);
        return res.redirect(`/admin/admins/create`);
    }
    let fields = {
        name: req.body.name,
        email: req.body.email,
        dial_code: req.body.dial_code,
        mobile: req.body.mobile,
        role_id: req.body.role_id,
        status: req.body.status
    };
    if(req.body.image)
    {
        fields.image = req.body.image;
    }
    await Admin.findByIdAndUpdate(req.params.id, fields, { new: true });

    req.flash('success', [i18n.__('admin_account_updated_successfully')]);
    return res.redirect(`/admin/admins/update/${req.params.id}`);
});

router.post('/admins/delete/:id', [adminSession, rbac], async (req, res) => {
    const admin = await Admin.findByIdAndRemove(req.params.id);
    if (!admin) return errorMessage(res, 'no_record_found');
    return successMessage(res, 'success', 200, admin);
});

router.get('/admins/permission/:id', [adminSession, rbac], async (req, res) => {
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

router.post('/admins/permission/:id', [adminSession, rbac], async (req, res) => {
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
