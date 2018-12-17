const express = require('express');
const adminSession = require('../../middleware/adminSession');
const i18n = require("i18n");
const { Admin, validate } = require('../../models/admin');
const { UsersRoles } = require('../../models/usersRoles');
const { Countries } = require('../../models/countries');
const { successMessage, errorMessage, uploadFile } = require('../../helpers/SocketHelper');
const _ = require('lodash');
const bcrypt = require('bcrypt');


const router = express.Router();

router.get('/admins', adminSession, async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');

    res.render('admin/admins/index', {
        layout: "admin/include/layout",
        title: i18n.__('admins'),
        error: error,
        success: success
    });
});

router.post('/admins/listings', adminSession, async (req, res) => {
    Admin.dataTables({
        limit: req.body.length,
        skip: req.body.start,
        order: req.body.order,
        columns: req.body.columns,
        search: {
            value: req.body.search.value,
            fields: ['name', 'email']
        },
    }).then(function (table) {
        res.json({
            data: table.data,
            recordsFiltered: table.total,
            recordsTotal: table.total
        });
    });
});


router.get('/admins/create', adminSession, async (req, res) => {
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

router.post('/admins/create', adminSession, async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        res.redirect(`/admin/admins/create`);
    }

    let user = await Admin.findOne({ email: req.body.email });
    if (user) return errorMessage(res, 'user_already_registered');

    admin = new Admin(_.pick(req.body, ['name', 'email', 'dial_code', 'mobile', 'role_id', 'password', 'status']));
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(admin.password, salt);
    await admin.save();

    // await uploadFile(req, res, 'image', 'images', function(err, message) {
    //     console.log(err);
    //     console.log(message);
    // });

    req.flash('success', [i18n.__('admin_saved_successfully')]);
    return res.redirect('/admin/admins/create');
});


router.get('/admins/update/:id', adminSession, async (req, res) => {
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

    res.render('admin/admins/update', {
        layout: "admin/include/layout",
        title: i18n.__('update_admin'),
        error: error,
        success: success,
        admins: admins,
        usersRoles: usersRoles
    });
});

router.post('/admins/update/:id', adminSession, async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        res.redirect(`/admin/admins/update/${req.params.id}`);
    }

    await Admin.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        email: req.body.email,
        role_id: req.body.role_id,
        password: req.body.password,
        status: req.body.status
    }, { new: true });

    req.flash('success', [i18n.__('admin_updated_successfully')]);
    return res.redirect(`/admin/admins/update/${req.params.id}`);
});


router.post('/admins/delete/:id', adminSession, async (req, res) => {
    const admin = await Admin.findByIdAndRemove(req.params.id);
    if (!admin) return errorMessage(res, 'no_record_found');
    return successMessage(res, 'success', 200, admin);
});
module.exports = router; 
