const express = require('express');
const adminSession = require('../../middleware/adminSession');
const i18n = require("i18n");
const LineByLineReader = require('line-by-line');
const dir = require('node-dir');
const { successMessage } = require('../../helpers/SocketHelper');
const fs = require("fs");
const filesize = require("filesize");
const _ = require('lodash');
const router = express.Router();

router.get('/logs', adminSession, async (req, res) => {
    res.render('admin/logs/logs', {
        layout: "admin/include/layout",
        title: i18n.__('all_logs')
    });
});


router.get('/logs/prepare', adminSession, async (req, res) => {
    let filePath = (__dirname + `/../../logs/`);
    dir.readFilesStream(filePath, {
        match: /.log$/,
        exclude: /^\./
    },
    function (err, stream, filename, next) {
        if (err) throw err;
        var content = '';
        stream.on('data', function (buffer) {
            content += buffer.toString();
        });
        stream.on('end', function () {
            // console.log('content:', content);
            next();
        });
    },
    async function (err, files) {
        if (err) throw err;
        let output = new Array();
        await _.forEach(files, function(file) {
            const stats = fs.statSync(file)
            const fileSizeInBytes = stats.size;
            let size = filesize(fileSizeInBytes, {bits: true});
            let fileName = '';
            if(_.includes(file,'\\'))
            {
                fileName = _.last(file.split("\\"));
            } else {
                fileName = _.last(file.split("/"));
            }
            output.push({
                fileName : fileName,
                size : size
            })
        })
        
        req.app.io.emit("logFilePrepairedEvent", output);
        // console.log('finished reading files:', output);
    });

    return successMessage(res, 'success', 200);
});

router.get('/logs/file/:file', adminSession, async (req, res) => {
    let filePath = (__dirname + `/../../logs/${req.params.file}`);
    let lr = new LineByLineReader(filePath);
    let data = [];
    lr.on('line', function (line) {
        data.push(line);
    });

    lr.on('error', function (err) {
        res.render('admin/logs/logsFile', {
            layout: "admin/include/layout",
            title: i18n.__('logs'),
            data: []
        });
    });

    lr.on('end', function () {
        res.render('admin/logs/logsFile', {
            layout: "admin/include/layout",
            title: i18n.__('logs'),
            data: data
        });
    });
});

module.exports = router; 
