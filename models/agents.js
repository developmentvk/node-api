const Joi = require('joi');
const mongoose = require('mongoose');
const dataTables = require('mongoose-datatables');

const tableSchema = new mongoose.Schema({
	image: {
		type: String,
		maxlength: 50,
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
	email: {
		type: String,
		required: true,
		minlength: 5,
		maxlength: 255,
		default: null,
		unique: true
	},
	dial_code: {
		type: String,
		default: null,
		maxlength: 5
	},
	mobile: {
		type: String,
		default: null,
		maxlength: 15
	},
	password: {
		type: String,
		required: true,
		minlength: 5,
		default: null,
		maxlength: 1024
	},
	remember_token: {
		type: String,
		default: null,
		maxlength: 1024
	},
	status: {
		type: Number,
		default: 1,
		maxlength: 10// 0. "Inactive", 1. "Active", 2. "Blocked", 4. "Offline"
	},
}, {
		timestamps: true
	}
);
tableSchema.plugin(dataTables);
const agent = mongoose.model('Agents', tableSchema);

function validate(table) {
	const schema = {
		name: Joi.string().max(255).required(),
		en_name: Joi.string().max(255).required(),
		email: Joi.string().min(5).max(255).required().email(),
		dial_code: Joi.number().min(0).allow('').optional(),
		mobile: Joi.number().min(0).allow('').optional(),
		image: Joi.string().allow('').optional(),
		file: Joi.string().allow('').optional(),
		role_id: Joi.objectId().required(),
		password: Joi.string().min(5).max(255).required(),
		confirm: Joi.string().valid(Joi.ref('password')).required().options({ language: { any: { allowOnly: 'must match password' } } }),
		status: Joi.any().valid('0', '1', '2', '3').required()
	};

	return Joi.validate(table, schema);
}

exports.Agent = agent;
exports.validate = validate;