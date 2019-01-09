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
	iso_code: {
		type: String,
		maxlength: 5,
		default: null
	},
	dial_code: {
		type: Number,
		maxlength: 5,
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
tableSchema.plugin(dataTables);
const Countries = mongoose.model('Countries', tableSchema);

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
		iso_code: Joi.string().max(5).required().label(i18n.__('iso_code')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		dial_code: Joi.string().max(5).required().label(i18n.__('dial_code')).error(errors => {
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

exports.Countries = Countries;
exports.validate = validate;