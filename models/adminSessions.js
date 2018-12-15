const Joi = require('joi');
const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    admin_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Admin',
		default: null
	},
    name: {
		type: String,
		maxlength: 255,
		default: null
	},
	en_name: {
		type: String,
		maxlength: 255,
		default: null
	},
	icon: {
		type: String,
		maxlength: 50,
		default: null
	},
	
	action_path: {
		type: String,
		maxlength: 255,
		default: null
	},
	status: {
		type: Number,
		default: 1 //0.Inactive, 1.Active
	},
	show_in_menu: {
		type: Number,
		default: 1 //0.No, 1.Yes
	},
	show_in_permission: {
		type: Number,
		default: 1 //0.No, 1.Yes
	},
	child_permission: {
		type: Number,
		default: 1 //0.No, 1.Yes
	},
	display_order: {
		type: Number,
		default: 1 //0.No, 1.Yes
	}
}, {
		timestamps: true
	}
);

const adminSessions = mongoose.model('adminSessions', tableSchema);

exports.adminSessions = adminSessions;