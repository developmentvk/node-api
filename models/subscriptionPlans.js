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
	annually_rental_fee: { 
		type: Number, 
		min: 0 //Price / month (billed annually)	
	},
	monthly_rental_fee: { 
		type: Number, 
		min: 0 //Price / month (billed monthly)	
	},
	chat_history: { 
		type: Number, 
		min: 0 //0 - Unlimited 
	},
	status: {
		type: Number,
		default: 1 //0.Inactive, 1.Active
	},
	isArchive: {
		type: Boolean,
		default: false 
	},
	isDefault: {
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
const SubscriptionPlans = mongoose.model('SubscriptionPlans', tableSchema);

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
		annually_rental_fee: Joi.number().max(255).required().label(i18n.__('annually_rental_fee')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		monthly_rental_fee: Joi.number().max(255).required().label(i18n.__('monthly_rental_fee')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		chat_history: Joi.number().max(255).required().label(i18n.__('chat_history')).error(errors => {
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

exports.SubscriptionPlans = SubscriptionPlans;
exports.validate = validate;