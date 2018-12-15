const express = require('express');
const adminSession = require('../../middleware/adminSession');
const i18n = require("i18n");
const LineByLineReader = require('line-by-line');
    
const router = express.Router();

router.get('/logs', adminSession, async (req, res) => {
    let filePath = (__dirname + `/../../logs/logfile.log`);
    let lr = new LineByLineReader(filePath);
    let data = [];
    lr.on('line', function (line) { 
        data.push(line);
    }); 

    lr.on('error', function (err) {
        res.render('admin/logs/logs', {
            layout: "admin/include/layout",
            title: i18n.__('logs'),
            data : []
        });
    });

    lr.on('end', function () { 
        res.render('admin/logs/logs', {
            layout: "admin/include/layout",
            title: i18n.__('logs'),
            data : data
        });
    });
});

router.get('/exceptions', adminSession, async (req, res) => {
    let filePath = (__dirname + `/../../logs/uncaughtExceptions.log`);
    let lr = new LineByLineReader(filePath);
    let data = [];
    lr.on('line', function (line) { 
        data.push(line);
    }); 

    lr.on('error', function (err) {
        res.render('admin/logs/exceptions', {
            layout: "admin/include/layout",
            title: i18n.__('exceptions'),
            data : []
        });
    });

    lr.on('end', function () { 
        res.render('admin/logs/exceptions', {
            layout: "admin/include/layout",
            title: i18n.__('exceptions'),
            data : data
        });
    });
});

module.exports = router; 