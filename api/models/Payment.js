const mongoose = require('mongoose')

const paymentSchema = mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'orderModel'
    },
    address: {
        type: String,
        required: true
    },
    pin: {
        type: Number,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    cardNumber: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('paymentModel', paymentSchema)