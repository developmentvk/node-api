const express = require('express');
const adminAuth = require('../../middleware/adminAuth');
const { Admin, validateLogin } = require('../../models/admin');
const i18n = require("i18n");
const bcrypt = require('bcrypt');
const router = express.Router();

router.get('/', adminAuth, async (req, res) => {
    let error = req.flash('error');
    
    res.render('admin/dashboard', {
        layout: "admin/include/layout",
        title: i18n.__('dashboard'),
        message: error,
        hasError: error.length > 0,
    });
});

module.exports = router; 
