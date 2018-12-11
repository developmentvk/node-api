const express = require('express');
const adminSession = require('../../middleware/adminSession');
const i18n = require("i18n");
const router = express.Router();

router.get('/dashboard', adminSession, async (req, res) => {
    let error = req.flash('error');

    res.render('admin/dashboard', {
        layout: "admin/include/layout",
        title: i18n.__('dashboard'),
        message: error,
        hasError: error.length > 0,
    });
});


router.get('/logout', adminSession, async (req, res) => {
    if (req.session.admin && req.cookies.sid) {
        res.clearCookie('sid');
        return res.redirect('/admin/login');
    } else {
        return res.redirect('/admin/login');
    }
});

module.exports = router; 