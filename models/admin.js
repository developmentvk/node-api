const Joi = require('joi');
const mongoose = require('mongoose');
const dataTables = require('mongoose-datatables');

const tableSchema = new mongoose.Schema({
	image: {
		type: String,
		maxlength: 50,
		default: null
	},
	role_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'UsersRoles',
		default: null
	},
	name: {
		type: String,
		required: true,
		default: null,
		minlength: 5,
		maxlength: 50
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
		type: Number,
		default: null,
		maxlength: 5
	},
	mobile: {
		type: Number,
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
});

tableSchema.plugin(dataTables);
const Admin = mongoose.model('Admins', tableSchema);

function validate(user) {
	const schema = {
		name: Joi.string().min(5).max(255).required(),
		email: Joi.string().min(5).max(255).required().email(),
		dial_code: Joi.number().min(0).allow('').optional(),
		mobile: Joi.number().min(0).allow('').optional(),
		role_id: Joi.objectId().required(),
		password: Joi.string().min(5).max(255).required(),
		confirm: Joi.string().valid(Joi.ref('password')).required().options({ language: { any: { allowOnly: 'must match password' } } }),
		status: Joi.any().valid('0', '1', '2', '3').required()
	};

	return Joi.validate(user, schema);
}

function validateLogin(user) {
	const schema = {
		username: Joi.string().min(5).max(255).required().email(),
		password: Joi.string().min(5).max(255).required(),
		rememberme: Joi.allow('').optional()
	};

	return Joi.validate(user, schema);
}

function validateForgotPassword(user) {
	const schema = {
		email: Joi.string().min(5).max(255).required().email(),
	};

	return Joi.validate(user, schema);
}

function validateUpdatePassword(user) {
	const schema = {
		password: Joi.string().min(5).max(255).required(),
		confirm: Joi.string().valid(Joi.ref('password')).required().options({ language: { any: { allowOnly: 'must match password' } } })
	};

	return Joi.validate(user, schema);
}

exports.Admin = Admin;
exports.validate = validate;
exports.validateLogin = validateLogin;
exports.validateForgotPassword = validateForgotPassword;
exports.validateUpdatePassword = validateUpdatePassword;