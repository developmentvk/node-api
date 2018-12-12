const express = require('express');
const adminSession = require('../../middleware/adminSession');
const i18n = require("i18n");
const router = express.Router();

router.get('/dashboard', adminSession, async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');

    res.render('admin/dashboard/index', {
        layout: "admin/include/layout",
        title: i18n.__('dashboard'),
        error: error,
        success: success
    });
});


router.get('/logout', adminSession, async (req, res) => {
    if (req.session.admin && req.cookies.session) {
        res.clearCookie('session');
        return res.redirect('/admin/login');
    } else {
        return res.redirect('/admin/login');
    }
});

module.exports = router; 
