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
		ref: 'NavigationsMasters',
		default: null
	}
}, {
		timestamps: true
	}
);

const RolesPermissions = mongoose.model('RolesPermissions', tableSchema);

function validate(table) {
	const schema = {
		role_id: Joi.objectId().required(),
		navigation_id: Joi.objectId().required()
	};
	return Joi.validate(table, schema);
}

exports.RolesPermissions = RolesPermissions;
exports.validate = validate;