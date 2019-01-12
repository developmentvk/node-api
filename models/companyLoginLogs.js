const mongoose = require('mongoose');
const moment = require('moment');
const ip = require('ip');
const dataTables = require('mongoose-datatables');


const tableSchema = new mongoose.Schema({
    company_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Companies',
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
tableSchema.plugin(dataTables);
const companyLoginLogs = mongoose.model('CompanyLoginLogs', tableSchema);

exports.CompanyLoginLogs = companyLoginLogs;