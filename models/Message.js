const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const messageSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    user_id:{
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    room_id:{
        type: String,
        required: true
    },
},{timestamps: true})

module.exports = mongoose.model('Message', messageSchema);