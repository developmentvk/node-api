const Joi = require('joi');
const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
	subscription_plan_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'SubscriptionPlans',
		default: null
	},
	navigation_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'CompanyNavigationMasters',
		default: null
	}
}, {
		timestamps: true
	}
);

const SubscriptionPlansPermissions = mongoose.model('SubscriptionPlansPermissions', tableSchema);

exports.SubscriptionPlansPermissions = SubscriptionPlansPermissions;