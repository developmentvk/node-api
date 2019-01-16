const express = require('express');
const adminSession = require('../../middleware/adminSession');
const rbac = require('../../middleware/rbac');
const i18n = require("i18n");
const { SubscriptionPlans, validate } = require('../../models/subscriptionPlans');
const { ModulesPermissions } = require('../../models/modulesPermissions');
const { successMessage, errorMessage, getGroupModule, getModulePermission } = require('../../helpers/MyHelper');
const _ = require('lodash');
const router = express.Router();

router.get('/subscription', [adminSession, rbac], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');

    res.render('admin/subscription/index', {
        layout: "admin/include/layout",
        title: i18n.__('all_subscriptions'),
        error: error,
        success: success
    });
});

router.post('/subscription/listings', [adminSession, rbac], async (req, res) => {
    SubscriptionPlans.dataTables({
        limit: req.body.length,
        skip: req.body.start,
        order: req.body.order,
        columns: req.body.columns,
        find: {
            isArchive: false,
            isDeleted: false
        },
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


router.get('/subscription/create', [adminSession, rbac], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    res.render('admin/subscription/create', {
        layout: "admin/include/layout",
        title: i18n.__('create_subscription'),
        error: error,
        success: success
    });
});

router.post('/subscription/create', [adminSession, rbac], async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect(`/admin/subscription/create`);
    }
    const subscriptionPlans = new SubscriptionPlans({
        name: req.body.name,
        en_name: req.body.en_name,
        annually_rental_fee: req.body.annually_rental_fee,
        monthly_rental_fee: req.body.monthly_rental_fee,
        chat_history: req.body.chat_history,
        status: req.body.status
    })
    await subscriptionPlans.save();
    req.flash('success', [i18n.__('subscription_saved_successfully')]);
    return res.redirect('/admin/subscription/create');
});

router.get('/subscription/update/:id', [adminSession, rbac], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    const subscriptionPlans = await SubscriptionPlans.findOne({
        _id: req.params.id
    });
    if (!subscriptionPlans) {
        req.flash('error', [i18n.__('record_not_found')]);
        return res.redirect('/admin/subscription');
    }
    res.render('admin/subscription/update', {
        layout: "admin/include/layout",
        title: i18n.__('update_subscription'),
        error: error,
        success: success,
        data: subscriptionPlans
    });
});

router.post('/subscription/update/:id', [adminSession, rbac], async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        res.redirect(`/admin/subscription/update/${req.params.id}`);
    }

    await SubscriptionPlans.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        en_name: req.body.en_name,
        annually_rental_fee: req.body.annually_rental_fee,
        monthly_rental_fee: req.body.monthly_rental_fee,
        chat_history: req.body.chat_history,
        status: req.body.status,
    }, { new: true });

    req.flash('success', [i18n.__('subscription_updated_successfully')]);
    return res.redirect(`/admin/subscription/update/${req.params.id}`);
});

router.post('/subscription/delete/:id', [adminSession, rbac], async (req, res) => {
    const subscription = await SubscriptionPlans.findByIdAndUpdate(req.params.id, { isArchive: true }, { new: true });
    if (!subscription) return errorMessage(res, 'no_record_found');
    return successMessage(res, 'success', 200, subscription);
});


router.get('/subscription/permission/:id', [adminSession, rbac], async (req, res) => {
    if (!req.params.id) {
        req.flash('error', [i18n.__('record_not_found')]);
        return res.redirect('/admin/subscription');
    }

    let error = req.flash('error');
    let success = req.flash('success');
    let modules = await getGroupModule();
    let modulePermissions = await getModulePermission(req.params.id);
    res.render('admin/subscription/permission', {
        layout: "admin/include/layout",
        title: i18n.__('subscription_permission'),
        error: error,
        success: success,
        modules: modules,
        modulePermissions: modulePermissions
    });
});

router.post('/subscription/permission/:id', [adminSession, rbac], async (req, res) => {
    if (!req.params.id) {
        req.flash('error', [i18n.__('record_not_found')]);
        return res.redirect(`/admin/subscription/permission/${req.params.id}`);
    }

    ModulesPermissions.deleteMany({ subscription_plan_id: req.params.id }).exec();

    if (req.body.hasOwnProperty('module_id')) {
        _.forEach(req.body.module_id, function (module_id) {
            const modulesPermissions = new ModulesPermissions({
                subscription_plan_id: req.params.id,
                module_id: module_id
            })
            modulesPermissions.save();
        });
    }

    req.flash('success', [i18n.__('module_permission_updated_successfully')]);
    return res.redirect(`/admin/subscription/permission/${req.params.id}`);
});

module.exports = router; 
