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
		ref: 'NavigationsMasters',
		default: null
	}
}, {
		timestamps: true
	}
);

const UsersPermissions = mongoose.model('UsersPermissions', tableSchema);

function validate(table) {
	const schema = {
		admin_id: Joi.objectId().required(),
		navigation_id: Joi.objectId().required()
	};
	return Joi.validate(table, schema);
}

exports.UsersPermissions = UsersPermissions;
exports.validate = validate;