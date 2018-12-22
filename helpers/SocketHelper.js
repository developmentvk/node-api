const winston = require('winston');
const i18n = require("i18n");
const nodemailer = require('nodemailer');
const config = require('config');
const ejs = require('ejs');
const multer = require('multer');
const crypto = require('crypto');
const path = require("path");
const { NavigationMasters } = require('../models/navigationMasters');
const { RolesPermissions } = require('../models/rolesPermissions');
const { UsersPermissions } = require('../models/usersPermissions');
const arrayToTree = require('array-to-tree');
const _ = require('lodash');

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

function uploadFile(req, res, fileName, fileLocation, callback) {
    let uploadedFilename = '';
    let upload = multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, path.join(__dirname, `../public/uploads/${fileLocation}/`))
            },
            filename: (req, file, cb) => {
                let customFileName = crypto.randomBytes(18).toString('hex'),
                    fileExtension = file.originalname.split('.')[1] // get file extension from original file name
                uploadedFilename = customFileName + '.' + fileExtension;
                cb(null, uploadedFilename);
            }
        })
    }).single(fileName);
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            winston.error("A Multer error occurred when uploading.");
            callback(err, null);
            return;
        } else if (err) {
            winston.error("An unknown error occurred when uploading.");
            callback(err, null);
            return;
        }
        winston.info(res);
        callback(null, uploadedFilename);
        return;
    });

}

async function getGroupNavigation() {
    let navigationMasters = await NavigationMasters.find({
        status: 1,
        show_in_permission: 1
    }).sort({ display_order: 'asc' }).select(['name', 'en_name', 'parent_id']).exec();
    if (navigationMasters.length > 0) {
        navigationMasters = JSON.parse(JSON.stringify(navigationMasters));
        navigationMasters = arrayToTree(navigationMasters, {
            parentProperty: 'parent_id',
            customID: '_id'
        });
    }
    return navigationMasters;
}

async function getRolePermission(role_id) {
    let rolesPermissions = await RolesPermissions.find({
        role_id: role_id
    }).select(['navigation_id']).exec();
    if (rolesPermissions.length > 0) {
        rolesPermissions = JSON.parse(JSON.stringify(rolesPermissions));
    }
    return rolesPermissions;
}

async function getUsersPermission(admin_id) {
    let usersPermissions = await UsersPermissions.find({
        admin_id: admin_id
    }).select(['navigation_id']).exec();
    if (usersPermissions.length > 0) {
        usersPermissions = JSON.parse(JSON.stringify(usersPermissions));
    }
    return usersPermissions;
}

async function getUsersPermissionIDs(req) {
    let output = new Array();
    let usersPermissions = await UsersPermissions.find({
        admin_id: req.session.admin._id
    }).select(['navigation_id']).select(["navigation_id", '-_id']).exec();
    if (usersPermissions.length > 0) {
        output = _.map(usersPermissions, _.property('navigation_id'));
    } else {
        let rolesPermissions = await RolesPermissions.find({
            role_id: req.session.admin.role_id
        }).select(["navigation_id", '-_id']).exec();
        if (rolesPermissions.length > 0) {
            output = _.map(usersPermissions, _.property('navigation_id'));
        }
    }
    return output;
}

async function navigationMenuListing(req) {
    let excludeRoleId = config.get('excludeRoleId');
    let navigationMasters = [];
    if(excludeRoleId === req.session.admin.role_id)
    {
        navigationMasters = await NavigationMasters.find({
            status: 1
        }).sort({ display_order: 'asc' }).select(['-createdAt', '-updatedAt', '-status', '-show_in_permission', '-child_permission', '-display_order']).exec();
    } else {
        const allowedNavIds = await getUsersPermissionIDs(req);
        navigationMasters = await NavigationMasters.find({
            status: 1,
            _id: { $in: allowedNavIds }
        }).sort({ display_order: 'asc' }).select(['-createdAt', '-updatedAt', '-status', '-show_in_permission', '-child_permission', '-display_order']).exec();
    }
    req.session.admin.navigationPermissions = navigationMasters;
    if (navigationMasters.length > 0) {
        navigationMasters = JSON.parse(JSON.stringify(navigationMasters));
        navigationMasters = arrayToTree(navigationMasters, {
            parentProperty: 'parent_id',
            customID: '_id'
        });
    }
    req.session.admin.navigations = navigationMasters;
    return navigationMasters;
}

exports.successMessage = successMessage;
exports.errorMessage = errorMessage;
exports.sendEmail = sendEmail;
exports.uploadFile = uploadFile;
exports.getGroupNavigation = getGroupNavigation;
exports.getRolePermission = getRolePermission;
exports.getUsersPermission = getUsersPermission;
exports.navigationMenuListing = navigationMenuListing;
