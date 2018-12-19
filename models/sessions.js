const mongoose = require('mongoose');
const tableSchema = new mongoose.Schema({
    expires: {
        type: Date,
    },
    lastModified: {
        type: Date,
    },
    session: {
        type: String,
    },
});
const Sessions = mongoose.model('Sessions', tableSchema);

exports.Sessions = Sessions;