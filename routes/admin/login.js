const express = require('express');
const adminAuth = require('../../middleware/adminAuth');
const { Admin, validateLogin } = require('../../models/admin');
const i18n = require("i18n");
const bcrypt = require('bcrypt');
const router = express.Router();

router.get('/login', adminAuth, async (req, res) => {
    let error = req.flash('error');
    
    res.render('admin/login', {
        layout: "admin/include/loginLayout",
        title: "Login",
        message: error,
        hasError: error.length > 0,
    });
});

router.post('/login', async (req, res) => {
    const { error } = validateLogin(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect('/admin/login');
    }

    let admin = await Admin.findOne({ email: req.body.username });
    if (!admin) {
        req.flash('error', [i18n.__('invalid_combination')]);
        return res.redirect('/admin/login');
    }

    const validPassword = await bcrypt.compare(req.body.password, admin.password);
    if (!validPassword) {
        req.flash('error', [i18n.__('invalid_combination')]);
        return res.redirect('/admin/login');
    }

    req.session.admin = admin;
    return res.redirect('/admin/dashboard');
});

router.get('/forgot-password', adminAuth, async (req, res) => {
    res.render('admin/forgot-password', { layout: "admin/include/loginLayout", "title": "Forgot Password" });
});

module.exports = router; 
