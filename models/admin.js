const Joi = require('joi');
const i18n = require('i18n');
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
});

tableSchema.plugin(dataTables);
const Admin = mongoose.model('Admins', tableSchema);

function validate(user) {
	const schema = {
		name: Joi.string().min(5).max(255).required().label(i18n.__('name')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		email: Joi.string().min(5).max(255).required().email().label(i18n.__('email')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		dial_code: Joi.number().min(0).allow('').optional().label(i18n.__('dial_code')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		mobile: Joi.number().min(0).allow('').optional().label(i18n.__('mobile')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		image: Joi.string().allow('').optional().label(i18n.__('image')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		file: Joi.string().allow('').optional().label(i18n.__('file')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		role_id: Joi.objectId().required().label(i18n.__('role')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		password: Joi.string().min(5).max(255).required().label(i18n.__('password')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		confirm: Joi.string().valid(Joi.ref('password')).required().options({ language: { any: { allowOnly: 'must match password' } } }).label(i18n.__('confirm_password')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		status: Joi.any().valid('0', '1', '2', '3').required().label(i18n.__('status')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		})
	};

	return Joi.validate(user, schema);
}

function validateUpdate(user) {
	const schema = {
		name: Joi.string().min(5).max(255).required().label(i18n.__('name')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		email: Joi.string().min(5).max(255).required().email().label(i18n.__('email')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		dial_code: Joi.number().min(0).allow('').optional().label(i18n.__('dial_code')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		mobile: Joi.number().min(0).allow('').optional().label(i18n.__('mobile')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		file: Joi.string().allow('').optional().label(i18n.__('file')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		role_id: Joi.objectId().required().label(i18n.__('role')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		image: Joi.string().allow('').optional().label(i18n.__('image')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		status: Joi.any().valid('0', '1', '2', '3').required().label(i18n.__('status')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		})
	};

	return Joi.validate(user, schema);
}

function validateUpdateAccount(user) {
	const schema = {
		name: Joi.string().min(5).max(255).required().label(i18n.__('name')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		email: Joi.string().min(5).max(255).required().email().label(i18n.__('email')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		dial_code: Joi.number().min(0).allow('').optional().label(i18n.__('dial_code')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		mobile: Joi.number().min(0).allow('').optional().label(i18n.__('mobile')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		file: Joi.string().allow('').optional().label(i18n.__('file')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		image: Joi.string().allow('').optional().label(i18n.__('image')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		})
	};

	return Joi.validate(user, schema);
}

function validateLogin(user) {
	const schema = {
		username: Joi.string().min(5).max(255).required().email().label(i18n.__('username')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		password: Joi.string().min(5).max(255).required().label(i18n.__('password')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		rememberme: Joi.allow('').optional().label(i18n.__('remember_me')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		})
	};

	return Joi.validate(user, schema);
}

function validateForgotPassword(user) {
	const schema = {
		email: Joi.string().min(5).max(255).required().email().label(i18n.__('email')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
	};

	return Joi.validate(user, schema);
}

function validateUpdatePassword(user) {
	const schema = {
		password: Joi.string().min(5).max(255).required().label(i18n.__('password')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		confirm: Joi.string().valid(Joi.ref('password')).required().options({ language: { any: { allowOnly: 'must match password' } } }).label(i18n.__('confirm_password')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		})
	};

	return Joi.validate(user, schema);
}

function validateUpdateAccountPassword(user) {
	const schema = {
		old_password: Joi.string().min(5).max(255).required().label(i18n.__('old_password')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		password: Joi.string().min(5).max(255).required().label(i18n.__('password')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		confirm: Joi.string().valid(Joi.ref('password')).required().options({ language: { any: { allowOnly: 'must match password' } } }).label(i18n.__('confirm_password')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		})
	};

	return Joi.validate(user, schema);
}

exports.Admin = Admin;
exports.validate = validate;
exports.validateUpdate = validateUpdate;
exports.validateLogin = validateLogin;
exports.validateForgotPassword = validateForgotPassword;
exports.validateUpdatePassword = validateUpdatePassword;
exports.validateUpdateAccount = validateUpdateAccount;
exports.validateUpdateAccountPassword = validateUpdateAccountPassword;