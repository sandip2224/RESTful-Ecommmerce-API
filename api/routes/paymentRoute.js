const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const orderModel = require('../models/Order')
const paymentModel = require('../models/Payment')

const checkAuth = require('../middleware/checkAuth')

const {
    isAdminOrCustomer
} = require('../middleware/checkRoles')

const errormsg = (err) => {
    res.status(500).json({
        error: err
    })
}

router.get('/', (req, res) => {  // checkAuth
    paymentModel.find().populate('orderId')
        .exec()
        .then(docs => {
            // res.status(200).json(docs)
            // const docs = docs.filter(doc => doc.paymentStatus === 'CONFIRMED')
            res.status(200).json({
                count: docs.length,
                payments: docs.map(doc => {
                    return {
                        _id: doc._id,
                        order: {
                            id: doc.orderId._id,
                            product: {
                                id: doc.orderId.productId,
                            },
                            quantity: doc.orderId.quantity,
                            totalPrice: doc.orderId.totalPrice,
                        },
                        paymentStatus: doc.orderId.paymentStatus,
                        address: doc.address,
                        pin: doc.pin,
                        state: doc.state,
                        cardNumber: doc.cardNumber,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/api/payments/' + doc._id
                        }
                    }
                })
            })
        }).catch(errormsg)
})

router.get('/:paymentId', (req, res) => {  // checkAuth
    const id = req.params.paymentId;
    if (mongoose.isValidObjectId(id)) {
        paymentModel.findById(id).populate('orderId').then(doc => {
            if (doc) {
                res.status(200).json({
                    _id: doc._id,
                    order: {
                        id: doc.orderId._id,
                        product: {
                            id: doc.orderId.productId,
                        },
                        quantity: doc.orderId.quantity,
                        totalPrice: doc.orderId.totalPrice,
                    },
                    paymentStatus: doc.orderId.paymentStatus,
                    address: doc.address,
                    pin: doc.pin,
                    state: doc.state,
                    cardNumber: doc.cardNumber,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/api/payments/' + doc._id
                    }
                })
            }
            else {
                res.status(404).json({
                    message: 'No confirmed payment found for given ID'
                })
            }
        }).catch(errormsg)
    }
    else {
        return res.status(422).json({
            message: 'Payment ID is not valid!!'
        })
    }
})

router.post('/', async (req, res) => {  //checkAuth, isAdminOrCustomer
    orderModel.findById(req.body.orderId).exec().then(doc => {
        if (!doc) {
            return res.status(404).json({
                message: 'Payment failed! Order not found!!'
            })
        }
        console.log(doc.paymentStatus)
        if (doc.paymentStatus === 'CONFIRMED') {
            return res.status(400).json({
                message: 'Invalid request! Payment already processed!!'
            })
        }
        if (!req.body || !req.body.address || !req.body.pin || !req.body.state || !req.body.cardNumber) {
            return res.status(404).json({
                error: 'Required fields are missing!!'
            })
        }
        const payment = new paymentModel({
            orderId: req.body.orderId,
            address: req.body.address,
            pin: req.body.pin,
            state: req.body.state,
            cardNumber: req.body.cardNumber
        })
        payment.save().then(saver => console.log(saver)).catch(errormsg)
        orderModel.findByIdAndUpdate(req.body.orderId, { $set: { paymentStatus: 'CONFIRMED' } }, { new: true }).then(doc => {
            res.status(200).json({
                order: {
                    message: 'Payment confirmed! Your order is on it\'s way!!',
                    _id: doc._id,
                    product: {
                        id: doc.productId._id,
                        name: doc.productId.name,
                        price: doc.productId.price,
                        image: doc.productId.productImage
                    },
                    quantity: doc.quantity,
                    totalPrice: doc.totalPrice,
                    paymentStatus: doc.paymentStatus
                },
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/api/orders'
                }
            })
        }).catch(errormsg)
    }).catch(errormsg)
})

module.exports = router