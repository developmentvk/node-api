const express = require('express');
const adminSession = require('../../middleware/adminSession');
const i18n = require("i18n");
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

router.get('/navigations/update/:id', adminSession, async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');

    res.render('admin/navigations/update', {
        layout: "admin/include/layout",
        title: i18n.__('update_navigation'),
        error: error,
        success: success
    });
});

router.get('/navigations/create', adminSession, async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');

    res.render('admin/navigations/create', {
        layout: "admin/include/layout",
        title: i18n.__('create_navigation'),
        error: error,
        success: success
    });
});

module.exports = router; 
