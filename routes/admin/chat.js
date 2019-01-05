const express = require('express');
const adminSession = require('../../middleware/adminSession');
const rbac = require('../../middleware/rbac');
const i18n = require("i18n");
const _ = require('lodash');
const router = express.Router();

router.get('/chats', [adminSession], async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');

    res.render('admin/chats/index', {
        layout: "admin/include/layout",
        title: i18n.__('chats'),
        error: error,
        success: success
    });
});

module.exports = router; 
