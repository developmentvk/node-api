const winston = require('winston');
const i18n = require("i18n");
const nodemailer = require('nodemailer');
const config = require('config');
const ejs = require('ejs');

function successMessage(res, template = '', httpCode = 200, dataArr = null) {
    let output = new Object();
    output.message = i18n.__(template);
    output.data = dataArr;
    return res.status(httpCode).send(output);
}

function errorMessage(res, template = null, object = false, httpCode = 422) {
    if (object == true) {
        delete (template.path)
        delete (template.type)
        delete (template.context)
        return res.status(httpCode).send(template);
    } else {
        let output = new Object();
        output.message = i18n.__(template);
        return res.status(httpCode).send(output);
    }
}

function sendEmail(to, template, data, subject) {
    let MAIL_USERNAME = config.get('MAIL_USERNAME');
    let MAIL_PASSWORD = config.get('MAIL_PASSWORD');

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: MAIL_USERNAME, // user
            pass: MAIL_PASSWORD // password
        }
    });
    let filePath = (__dirname + `/../views/emails/${template}.ejs`);
    ejs.renderFile(filePath, data, function (err, html_body) {
        if (err) {
            return winston.error(JSON.stringify(err));
        }

        // setup email data with unicode symbols
        let mailOptions = {
            from: `"NodeJS 👻" <${MAIL_USERNAME}>`, // sender address
            to: to, // list of receivers
            subject: `${subject} ✔`, // Subject line
            html: html_body // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return winston.error(JSON.stringify(error));
            }
            return winston.info(JSON.stringify(info));
        });
    });
}

exports.successMessage = successMessage;
exports.errorMessage = errorMessage;
exports.sendEmail = sendEmail;
