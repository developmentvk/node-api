const mongoose = require('mongoose');
const dataTables = require('mongoose-datatables');
const moment = require('moment');

const tableSchema = new mongoose.Schema({
	ticket_id: {
		type: String,
		default: null
	},
	company_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Companies',
		default: null
	},
	customer_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Customers',
		default: null
	},
	agent_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Agents',
		default: null
	},
	feedback_message: {
		type: String,
		default: null
	},
	feedback: {
		type: String,
		default: null// thumbs up & thumbs down
	},
	status: {
		type: Number,
		default: 1 // 1. Opened, 2.Closed
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

tableSchema.methods.generateTicketID = function () {
    return moment().format('sYYHH');
};

const chatTickets = mongoose.model('ChatTickets', tableSchema);

exports.ChatTickets = chatTickets;