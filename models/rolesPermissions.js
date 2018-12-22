const Joi = require('joi');
const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
	role_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'UsersRoles',
		default: null
	},
	navigation_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'NavigationMasters',
		default: null
	}
}, {
		timestamps: true
	}
);

const RolesPermissions = mongoose.model('RolesPermissions', tableSchema);

exports.RolesPermissions = RolesPermissions;