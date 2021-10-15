const mongoose = require('mongoose')

const orderSchema = mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'productModel'
    },
    quantity: {
        type: Number,
        default: 1
    },
    total: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    paymentStatus:{
        type: String,
        enum: ['PENDING', 'CONFIRMED'],
        default: 'PENDING'
    }
})
module.exports = mongoose.model('orderModel', orderSchema)