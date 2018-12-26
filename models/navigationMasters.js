const Joi = require('joi');
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
		ref: 'NavigationMasters',
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
const NavigationMasters = mongoose.model('NavigationMasters', tableSchema);

function validate(table) {
	const schema = {
		name: Joi.string().max(255).required(),
		en_name: Joi.string().max(255).required(),
		icon: Joi.allow('').optional(),
		parent_id: Joi.objectId().allow('').optional(),
		action_path: Joi.allow('').optional(),
		status: Joi.any().valid('0', '1').required(),
		show_in_menu: Joi.any().valid('0', '1').required(),
		show_in_permission: Joi.any().valid('0', '1').required(),
		display_order: Joi.number().min(0).required()
	};

	return Joi.validate(table, schema);
}

exports.NavigationMasters = NavigationMasters;
exports.validate = validate;