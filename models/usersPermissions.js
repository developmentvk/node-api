const Joi = require('joi');
const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
	admin_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Admin',
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

const UsersPermissions = mongoose.model('UsersPermissions', tableSchema);

exports.UsersPermissions = UsersPermissions;