const mongoose = require('mongoose');
const moment = require('moment');
const ip = require('ip');


const tableSchema = new mongoose.Schema({
    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admins',
        default: null
    },
    login_at: {
        type: Date,
        required: true,
        default: Date.now
    },
    logout_at: {
        type: Date,
        default: null
    },
    ip_address: {
        type: String,
        required: true,
        default: ip.address()
    },
    browser: {
        type: String,
        required: true,
        default: null
    },
    session_id: {
        type: String,
        default: null
    },
    isActive: {
        type : Boolean,
        default : true
    }
}, {
        timestamps: true
    }
);
const AdminLoginLogs = mongoose.model('AdminLoginLogs', tableSchema);

exports.AdminLoginLogs = AdminLoginLogs;