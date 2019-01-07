const Joi = require('joi');
const mongoose = require('mongoose');
const dataTables = require('mongoose-datatables');

const tableSchema = new mongoose.Schema({
	company_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Companies',
		default: null
	},
	name: {
		type: String,
		maxlength: 255,
		default: null
	},
	mobile: {
		type: String,
		maxlength: 255,
		default: null
	},
	email: {
		type: String,
		maxlength: 255,
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
const customer = mongoose.model('Customers', tableSchema);

function validate(table) {
	const schema = {
		company_id: Joi.required(),
		name: Joi.string().max(255).required(),
		mobile: Joi.string().max(255).required(),
		email: Joi.string().max(255).required(),
		status: Joi.any().valid('0', '1').required(),
	};

	return Joi.validate(table, schema);
}

exports.Customer = customer;
exports.validate = validate;