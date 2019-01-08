const mongoose = require('mongoose');
const dataTables = require('mongoose-datatables');

const tableSchema = new mongoose.Schema({
	company_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Companies',
		default: null
	},
	chat_ticket_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'ChatTickets',
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
	message: {
		type: String,
		default: null
	},
	has_media: {
        type: Number, 
        default: false //  1.true, 0.false,
	},
	media_mimes: {
        type: String, 
        default: null
	},
	read_by_customer: {
        type: Boolean,
        default: false
    },
    read_by_admin: {
        type: Boolean,
        default: false
    },
	send_by: {
		type: Number,
		default: 1 // 1. Customer, 2. Admin
	}
}, {
		timestamps: true
	}
);
tableSchema.plugin(dataTables);
const chatHistory= mongoose.model('ChatHistories', tableSchema);

exports.ChatHistories = chatHistory;