const Joi = require('joi');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	image: {
		type: String,
		maxlength: 50
	},
	name: {
		type: String,
		required: true,
		minlength: 5,
		maxlength: 50
	},
	email: {
		type: String,
		required: true,
		minlength: 5,
		maxlength: 255,
		unique: true
	},
	password: {
		type: String,
		required: true,
		minlength: 5,
		maxlength: 1024
	},
	remember_token: {
		type: String,
		maxlength: 1024
	},
});

const Admin = mongoose.model('Admin', userSchema);

function validateLogin(user) {
	const schema = {
		username: Joi.string().min(5).max(255).required().email(),
		password: Joi.string().min(5).max(255).required()
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
exports.validateLogin = validateLogin;
exports.validateForgotPassword = validateForgotPassword;
exports.validateUpdatePassword = validateUpdatePassword;