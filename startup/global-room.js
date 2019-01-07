const _ = require('lodash');
const i18n = require("i18n");
const { Company } = require('../models/company');
const { ChatHistories } = require('../models/chatHistory');
const { ChatTickets } = require('../models/chatTickets');
const { Customer } = require('../models/customers');

module.exports = function (io, socketUsers, socketAdmins) {
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
                message : data.message,
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
            let admin_id = null;
            let adminData = null;
            let adminsData = socketAdmins.GetRoomList(dataArr.room);
            if(adminsData.length > 0)
            {
                adminData = adminsData[0];
                admin_id = adminData.id;
            }
            let chatTickets = new ChatTickets();
            chatTickets.ticket_id = chatTickets.generateTicketID();
            chatTickets.company_id = company._id;
            chatTickets.customer_id = customer._id;
            chatTickets.admin_id = admin_id;
            chatTickets.status = 1;
            chatTickets = await chatTickets.save();
            if(!chatTickets) {
                callback(404, i18n.__("ticket_not_generated"));
                return;
            }

            const chatHistories = new ChatHistories({
                company_id: company._id,
                chat_ticket_id: chatTickets._id,
                customer_id: customer._id,
                admin_id: admin_id,
                message: dataArr.message,
                has_media: false, // 1.true, 0.false,
                media_mimes: null,
                read_by_customer: true,
                read_by_admin: false,
                send_by: 1, //// 1. Customer, 2. Admin
            })
            let chatHistoriesData = await chatHistories.save();

            let message = i18n.__('chat_welcome_message', {
                name : customer.name,
                ticket_id : chatTickets.ticket_id
            });
            // Return message connection established successful
            callback(200, {
                id : chatTickets._id,
                ticket_id : chatTickets.ticket_id,
                message : message,
                adminData : adminData,
                data : chatHistoriesData
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