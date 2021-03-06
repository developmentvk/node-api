const Joi = require('joi');
const i18n = require('i18n');
const mongoose = require('mongoose');
const dataTables = require('mongoose-datatables');

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
	},
	isArchive: {
		type: Boolean,
		default: false 
	},
	isDeleted: {
		type: Boolean,
		default: false 
	}
}, {
		timestamps: true
	}
);
tableSchema.plugin(dataTables);
const UsersRoles = mongoose.model('UsersRoles', tableSchema);

function validate(table) {
	const schema = {
		name: Joi.string().max(255).required().label(i18n.__('name')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		en_name: Joi.string().max(255).required().label(i18n.__('en_name')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		status: Joi.any().valid('0', '1').required().label(i18n.__('status')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
	};

	return Joi.validate(table, schema);
}

exports.UsersRoles = UsersRoles;
exports.validate = validate;