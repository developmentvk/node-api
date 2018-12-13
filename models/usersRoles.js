const Joi = require('joi');
const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
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
	status: {
		type: Number,
		default: 1 //0.Inactive, 1.Active
	}
}, {
		timestamps: true
	}
);

const UsersRoles = mongoose.model('UsersRoles', tableSchema);

function validate(table) {
	const schema = {
		name: Joi.string().max(255).required(),
		en_name: Joi.string().max(255).required(),
		status: Joi.any().valid('0', '1').required(),
	};

	return Joi.validate(table, schema);
}

exports.UsersRoles = UsersRoles;
exports.validate = validate;