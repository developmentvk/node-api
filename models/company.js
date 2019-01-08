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
	status: {
		type: Number,
		default: 1 //0.Inactive, 1.Active
	},
	total_agents: {
		type: Number,
		default: 0
	}
}, {
		timestamps: true
	}
);
tableSchema.plugin(dataTables);
const company = mongoose.model('Companies', tableSchema);

function validate(table) {
	const schema = {
		name: Joi.string().max(255).required(),
		en_name: Joi.string().max(255).required(),
		status: Joi.any().valid('0', '1').required(),
	};

	return Joi.validate(table, schema);
}

exports.Company = company;
exports.validate = validate;