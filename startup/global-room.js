const _ = require('lodash');
const i18n = require("i18n");
const { Company } = require('../models/company');
const { ChatHistories } = require('../models/chatHistory');
const { ChatTickets } = require('../models/chatTickets');
const { Customer } = require('../models/customers');

module.exports = function (io, socketUsers, socketAgents) {
    io.on('connection', (socket) => {
        socket.on('gbc-room', (global, callback) => {
            // Join global room
            socket.join(global.room);
            // Join individual room
            socket.join(global.id);
            // Join current socket
            socket.join(socket.id);

            // Push data in local storage
            socketUsers.EnterRoom(socket.id, global.id, global.name, global.image, global.room);

            // const nameProp = socketUsers.GetRoomList(global.room);
            // const arr = _.uniqBy(nameProp, 'name');

            // Send alert to new user logged in
            io.to(global.room).emit('login', global);

            // Return message connection established successful
            callback(200, i18n.__("connected"));
        });

        socket.on('gbc-new-customer', async function(data, callback) {
            let dataArr = {
                name: data.name,
                mobile: data.mobile,
                email: data.email,
                lc_id : data.lc_id,
                room : data.room
            };
            const company = await Company.findOne({
                _id:dataArr.lc_id
            });
            if (!company) {
                callback(404, i18n.__("unregistered_company"));
                return;
            }

            let customer = await Customer.findOne({
                mobile: dataArr.mobile,
            });
            if (!customer) {
                const customerData = new Customer({
                    company_id: company._id,
                    name: dataArr.name,
                    mobile: dataArr.mobile,
                    email: dataArr.email,
                })
                customer = await customerData.save();
            }
            if(!customer) {
                callback(404, i18n.__("customer_not_created"));
                return;
            }
            let agent_id = null;
            let agent_name = i18n.__('support');
            let agent_image = "/images/agent.png";
            let agentSocketData = socketAgents.GetRoomList(dataArr.room);
            if(agentSocketData.length > 0)
            {
                agent_id = agentSocketData[0].id;
                agent_name = getLocale() == 'ar' ? agentSocketData[0].name : agentSocketData[0].en_name;
                if(agentSocketData[0].image)
                {
                    agent_image = `/uploads/images/${agentSocketData[0].image}`;
                }
            }
            let chatTickets = new ChatTickets();
            chatTickets.ticket_id = chatTickets.generateTicketID();
            chatTickets.company_id = company._id;
            chatTickets.customer_id = customer._id;
            chatTickets.agent_id = agent_id;
            chatTickets.status = 1;
            chatTickets = await chatTickets.save();
            if(!chatTickets) {
                callback(404, i18n.__("ticket_not_generated"));
                return;
            }

            let welcome_message = i18n.__('chat_welcome_message', {
                name : customer.name,
                agent_name : agent_name
            });

            let message = i18n.__('chat_message');
            // Return message connection established successful
            callback(200, {
                tid : chatTickets._id,
                tid : agent_id,
                cid : customer._id,
                welcome_message : welcome_message,
                message : message,
                an : agent_name,
                aim : agent_image,
            });
        });

        socket.on('disconnect', () => {
            // Remove user form local storage
            const user = socketUsers.RemoveUser(socket.id);
            if (user) {

                // var userData = socketUsers.GetRoomList(user.room);
                // const arr = _.uniqBy(userData, 'name');
                // const removeData = _.remove(arr, { 'name': user.name});

                // Send alert to user logged out
                io.to(user.room).emit('logout', user);
            }
        });




    });
}