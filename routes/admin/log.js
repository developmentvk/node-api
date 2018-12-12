const express = require('express');
const adminSession = require('../../middleware/adminSession');
const i18n = require("i18n");
const LineByLineReader = require('line-by-line');
    
const router = express.Router();

router.get('/logs', adminSession, async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    let filePath = (__dirname + `/../../logs/logfile.log`);
    let lr = new LineByLineReader(filePath);
    res.render('admin/logs/logs', {
        layout: "admin/include/layout",
        title: i18n.__('logs'),
        error: error,
        success: success,
        lr : lr
    });
});

router.get('/exceptions', adminSession, async (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');

    res.render('admin/logs/exceptions', {
        layout: "admin/include/layout",
        title: i18n.__('exceptions'),
        error: error,
        success: success
    });
});

module.exports = router; 
