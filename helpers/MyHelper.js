const winston = require('winston');
const i18n = require("i18n");
const nodemailer = require('nodemailer');
const config = require('config');
const ejs = require('ejs');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk')
const crypto = require('crypto');
const path = require("path");
const { NavigationMasters } = require('../models/navigationMasters');
const { RolesPermissions } = require('../models/rolesPermissions');
const { UsersPermissions } = require('../models/usersPermissions');
const { Modules } = require('../models/modules');
const { ModulesPermissions } = require('../models/modulesPermissions');
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
            from: `"${i18n.__('app_name')} 👻" <${MAIL_USERNAME}>`, // sender address
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

function buildImageLink(file) {
    return `/uploads/images/${file}`;
}

function uploadFile(req, res, fileName, fileLocation, cdn = false) {
    let uploadedFilename = '';
    let upload = null;

    const generateFileName = file => {
        const customName = crypto.randomBytes(18).toString('hex');
        const fileExtension = file.originalname.split('.')[file.originalname.split('.').length - 1] // get file extension from original file name
        uploadedFilename = `${customName}.${fileExtension}`;
        return uploadedFilename;
    };

    if (cdn) {
        AWS.config.update({
            "accessKeyId": config.get('AWS_ACCESS_KEY_ID'),
            "secretAccessKey": config.get('AWS_SECRET_ACCESS_KEY'),
            "region": config.get('AWS_DEFAULT_REGION')
        });

        upload = multer({
            storage: multerS3({
                s3: new AWS.S3(),
                bucket: config.get('AWS_BUCKET'),
                acl: config.get('AWS_ACCESS_CONTROL'),
                metadata: (req, file, cb) => {
                    cb(null, { fieldName: file.fieldname });
                },
                key: (req, file, cb) => {
                    cb(null, `uploads/${fileLocation}/${generateFileName(file)}`);
                }
            })
        }).single(fileName);
    } else {
        upload = multer({
            storage: multer.diskStorage({
                destination: (req, file, cb) => {
                    cb(null, path.join(__dirname, `../public/uploads/${fileLocation}/`))
                },
                filename: (req, file, cb) => {
                    cb(null, generateFileName(file));
                }
            })
        }).single(fileName);
    }

    return new Promise(function (resolve, reject) {
        upload(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                winston.error("A Multer error occurred when uploading.");
                reject(new Error(err));
            } else if (err) {
                winston.error("An unknown error occurred when uploading.");
                reject(new Error(err));
            }
            resolve(uploadedFilename);
        });
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

async function getRolePermission(accessRoleId) {
    let rolesPermissions = await RolesPermissions.find({
        role_id: accessRoleId
    }).select(['navigation_id']).exec();
    if (rolesPermissions.length > 0) {
        rolesPermissions = JSON.parse(JSON.stringify(rolesPermissions));
    }
    return rolesPermissions;
}

async function getUsersPermission(accessAdminId) {
    let usersPermissions = await UsersPermissions.find({
        admin_id: accessAdminId
    }).select(['navigation_id']).exec();
    if (usersPermissions.length > 0) {
        usersPermissions = JSON.parse(JSON.stringify(usersPermissions));
    }
    return usersPermissions;
}

async function getUsersPermissionIDs(accessAdminId, accessRoleId) {
    let output = new Array();
    let usersPermissions = await UsersPermissions.find({
        admin_id: accessAdminId
    }).select(['navigation_id']).select(["navigation_id", '-_id']).exec();
    if (usersPermissions.length > 1) {
        output = await _.map(usersPermissions, _.property('navigation_id'));
    } else {
        let rolesPermissions = await RolesPermissions.find({
            role_id: accessRoleId
        }).select(["navigation_id", '-_id']).exec();
        if (rolesPermissions.length > 0) {
            output = await _.map(rolesPermissions, _.property('navigation_id'));
        }
    }
    return output;
}

async function navigationMenuListing(req, saveSession = true, accessAdminId = null, accessRoleId = null) {
    let excludeRoleId = config.get('excludeRoleId');
    let navigationMasters = [];
    if (saveSession == true) {
        accessAdminId = req.session.admin._id;
        accessRoleId = req.session.admin.role_id;
    }

    if (excludeRoleId == accessRoleId) {
        navigationMasters = await NavigationMasters.find({
            status: 1
        }).sort({ display_order: 'asc' }).select(['-createdAt', '-updatedAt', '-status', '-show_in_permission', '-child_permission', '-display_order']).exec();
    } else {
        const allowedNavIds = await getUsersPermissionIDs(accessAdminId, accessRoleId);
        navigationMasters = await NavigationMasters.find({
            status: 1,
            _id: { $in: allowedNavIds }
        }).sort({ display_order: 'asc' }).select(['-createdAt', '-updatedAt', '-status', '-show_in_permission', '-child_permission', '-display_order']).exec();
    }
    if (saveSession == true) {
        req.session.navigationPermissions = navigationMasters;
    }
    if (navigationMasters.length > 0) {
        navigationMasters = JSON.parse(JSON.stringify(navigationMasters));
        navigationMasters = arrayToTree(navigationMasters, {
            parentProperty: 'parent_id',
            customID: '_id'
        });
    }
    if (saveSession == true) {
        req.session.admin.navigations = navigationMasters;
        req.session.save();
    } else {
        return navigationMasters;
    }

}

function hasAccess(req, actionPath, exclude = false) {
    if (exclude == true) { return true; }
    let result = _.find(req.session.navigationPermissions, { "action_path": actionPath });
    if (result !== undefined) { return true; } else { return false; }
}

/**
 * Subscription Module Start
 */
async function getGroupModule() {
    let modules = await Modules.find({
        status: 1,
        show_in_permission: 1
    }).sort({ display_order: 'asc' }).select(['name', 'en_name', 'parent_id']).exec();
    if (modules.length > 0) {
        modules = JSON.parse(JSON.stringify(modules));
        modules = arrayToTree(modules, {
            parentProperty: 'parent_id',
            customID: '_id'
        });
    }
    return modules;
}

async function getModulePermission(accessPlanId) {
    let modulesPermissions = await ModulesPermissions.find({
        subscription_plan_id: accessPlanId
    }).select(['module_id']).exec();
    if (modulesPermissions.length > 0) {
        modulesPermissions = JSON.parse(JSON.stringify(modulesPermissions));
    }
    return modulesPermissions;
}

async function getModulesPermissionIDs(accessPlanId) {
    let output = new Array();
    let modulesPermissions = await ModulesPermissions.find({
        subscription_plan_id: accessPlanId
    }).select(["module_id", '-_id']).exec();
    if (modulesPermissions.length > 0) {
        output = await _.map(modulesPermissions, _.property('module_id'));
    }
    return output;
}

async function moduleMenuListing(req, saveSession = true, accessPlanId = null) {
    let modules = [];
    if (saveSession == true) {
        accessPlanId = req.session.company.subscription_plan_id;
    }

    const allowedNavIds = await getModulesPermissionIDs(accessPlanId);
    modules = await Modules.find({
        status: 1,
        _id: { $in: allowedNavIds }
    }).sort({ display_order: 'asc' }).select(['-createdAt', '-updatedAt', '-status', '-show_in_permission', '-child_permission', '-display_order']).exec();
    if (saveSession == true) {
        req.session.modulesPermissions = modules;
    }
    if (modules.length > 0) {
        modules = JSON.parse(JSON.stringify(modules));
        modules = arrayToTree(modules, {
            parentProperty: 'parent_id',
            customID: '_id'
        });
    }
    if (saveSession == true) {
        req.session.company.modules = modules;
        req.session.save();
    } else {
        return modules;
    }

}

function hasModuleAccess(req, actionPath, exclude = false) {
    if (exclude == true) { return true; }
    let result = _.find(req.session.modulesPermissions, { "action_path": actionPath });
    if (result !== undefined) { return true; } else { return false; }
}

/**
 * Subscription Module End
 */

module.exports = {
    successMessage,
    errorMessage,
    sendEmail,
    uploadFile,
    getGroupNavigation,
    getRolePermission,
    getUsersPermission,
    navigationMenuListing,
    hasAccess,
    buildImageLink,
    getGroupModule,
    getModulePermission,
    moduleMenuListing,
    hasModuleAccess
};
