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
});

const Admin = mongoose.model('Admin', userSchema);

function validateUserLogin(user) {
	const schema = {
		username: Joi.string().min(5).max(255).required().email(),
		password: Joi.string().min(5).max(255).required()
	};

	return Joi.validate(user, schema);
}

exports.Admin = Admin;
exports.validateLogin = validateUserLogin;