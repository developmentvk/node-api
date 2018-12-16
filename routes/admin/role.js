const express = require('express');
const adminSession = require('../../middleware/adminSession');
const i18n = require("i18n");
const { UsersRoles, validate } = require('../../models/usersRoles');
const { successMessage, errorMessage } = require('../../helpers/SocketHelper');
const _ = require('lodash');
const router = express.Router();

router.get('/roles', adminSession, async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');

    res.render('admin/roles/index', {
        layout: "admin/include/layout",
        title: i18n.__('roles'),
        error: error,
        success: success
    });
});

router.post('/roles/listings', adminSession, async (req, res) => {
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


router.get('/roles/create', adminSession, async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    res.render('admin/roles/create', {
        layout: "admin/include/layout",
        title: i18n.__('create_role'),
        error: error,
        success: success
    });
});

router.post('/roles/create', adminSession, async (req, res) => {
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

router.get('/roles/update/:id', adminSession, async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    const roles = await UsersRoles.findOne({
        _id:req.params.id
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
        roles : roles
    });
});

router.post('/roles/update/:id', adminSession, async (req, res) => {
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



router.post('/roles/delete/:id', adminSession, async (req, res) => {
    const usersRoles = await UsersRoles.findByIdAndRemove(req.params.id);
	if (!usersRoles) return errorMessage(res, 'no_record_found');
	return successMessage(res, 'success', 200, usersRoles);
});
module.exports = router; 
