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
	icon: {
		type: String,
		maxlength: 50,
		default: null
	},
	parent_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'CompanyNavigationMasters',
		default: null
	},
	action_path: {
		type: String,
		maxlength: 255,
		default: null
	},
	status: {
		type: Number,
		default: 1 //0.Inactive, 1.Active
	},
	show_in_menu: {
		type: Number,
		default: 1 //0.No, 1.Yes
	},
	show_in_permission: {
		type: Number,
		default: 1 //0.No, 1.Yes
	},
	display_order: {
		type: Number,
		default: 1 //0.No, 1.Yes
	}
}, {
		timestamps: true
	}
);

tableSchema.plugin(dataTables);
const CompanyNavigationMasters = mongoose.model('CompanyNavigationMasters', tableSchema);

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
		icon: Joi.allow('').optional().label(i18n.__('icon')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		parent_id: Joi.objectId().allow('').optional().label(i18n.__('parent')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		action_path: Joi.allow('').optional().label(i18n.__('action_path')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		status: Joi.any().valid('0', '1').required().label(i18n.__('status')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		show_in_menu: Joi.any().valid('0', '1').required().label(i18n.__('show_in_menu')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		show_in_permission: Joi.any().valid('0', '1').required().label(i18n.__('show_in_permission')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		}),
		display_order: Joi.number().min(0).required().label(i18n.__('display_order')).error(errors => {
			return errors.map(err => { 
				return { message : i18n.__(`joi.${err.type}`, err.context)};
			});
		})
	};

	return Joi.validate(table, schema);
}

exports.CompanyNavigationMasters = CompanyNavigationMasters;
exports.validate = validate;