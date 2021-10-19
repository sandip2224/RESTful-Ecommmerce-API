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
            res.status(200).json(docs)
            // const result = docs.filter(doc => doc.paymentStatus === 'CONFIRMED')
            // res.status(200).json({
            //     count: result.length,
            //     orders: result.map(doc => {
            //         return {
            //             _id: doc._id,
            //             product: {
            //                 id: doc.productId._id,
            //                 name: doc.productId.name,
            //                 price: doc.productId.price,
            //                 image: doc.productId.productImage
            //             },
            //             quantity: doc.quantity,
            //             totalPrice: doc.totalPrice,
            //             createdAt: doc.createdAt,
            //             paymentStatus: doc.paymentStatus,
            //             request: {
            //                 type: 'GET',
            //                 url: 'http://localhost:3000/api/orders/' + doc._id
            //             }
            //         }
            //     })
            // })
        }).catch(errormsg)
})

router.post('/', (req, res) => {  //checkAuth, isAdminOrCustomer

    orderModel.findById(req.body.orderId).exec().then(doc => {
        if (!doc) {
            return res.status(404).json({
                message: 'Payment failed! Order not found!!'
            })
        }
        if (doc.paymentStatus === 'CONFIRMED') {
            return res.status(400).json({
                message: 'Invalid request! Payment already processed!!',
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/api/orders'
                }
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
    }).catch(errormsg)

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
})

module.exports = router