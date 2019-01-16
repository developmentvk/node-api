const Joi = require('joi');
const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
	subscription_plan_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'SubscriptionPlans',
		default: null
	},
	module_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Modules',
		default: null
	}
}, {
		timestamps: true
	}
);

const ModulesPermissions = mongoose.model('ModulesPermissions', tableSchema);

exports.ModulesPermissions = ModulesPermissions;