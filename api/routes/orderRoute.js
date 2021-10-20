const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const orderModel = require('../models/Order')
const productModel = require('../models/Product')
const checkAuth = require('../middleware/checkAuth')
const {
    isAdmin,
    isSeller,
    isCustomer,
    isAdminOrSeller
} = require('../middleware/checkRoles')

const errormsg = (err) => {
    res.status(500).json({
        error: err
    })
}

router.route('/')
    .get((req, res) => {//checkAuth, isCustomer
        orderModel.find().populate('productId')
            .exec()
            .then(docs => {
                // res.status(200).json(docs)
                res.status(200).json({
                    count: docs.length,
                    orders: docs.map(doc => {
                        return {
                            _id: doc._id,
                            product: {
                                id: doc.productId._id,
                                name: doc.productId.name,
                                price: doc.productId.price,
                                productImage: doc.productId.productImage
                            },
                            quantity: doc.quantity,
                            totalPrice: doc.totalPrice,
                            createdAt: doc.createdAt,
                            paymentStatus: doc.paymentStatus,
                            request: {
                                type: 'GET',
                                url: 'http://localhost:3000/api/orders/' + doc._id
                            }
                        }
                    })
                })
            }).catch(errormsg)
    })
    .post((req, res) => {  // checkAuth, isCustomer
        productModel.findById(req.body.productId).then(doc => {
            if (!doc) {
                return res.status(404).json({
                    message: 'Product not found!!'
                })
            }
            const order = new orderModel({
                productId: req.body.productId,
                quantity: req.body.quantity,
                totalPrice: doc.price * req.body.quantity
            })
            return order.save()
        })
            .then(result => {
                res.status(201).json({
                    message: 'Order created successfully!',
                    createdOrder: {
                        productId: result.productId,
                        quantity: result.quantity,
                        productImage: result.productImage
                    },
                    totalPrice: result.totalPrice,
                    createdAt: result.createdAt,
                    paymentStatus: result.paymentStatus,
                    _id: result._id,
                    request: {
                        type: "POST",
                        url: "http://localhost:3000/api/payments/" + result._id
                    }
                })
            }).catch(errormsg)
    })


router.route('/:orderId')
    .get((req, res) => {  // checkAuth, isCustomer
        if (mongoose.isValidObjectId(req.params.orderId)) {
            orderModel.findById(req.params.orderId).populate('productId')
                .exec().then(doc => {
                    if (!doc) {
                        return res.status(404).json({
                            message: 'Order not found!!'
                        })
                    }
                    res.status(200).json({
                        order: {
                            _id: doc._id,
                            product: {
                                id: doc.productId._id,
                                name: doc.productId.name,
                                price: doc.productId.price,
                                image: doc.productId.productImage
                            },
                            quantity: doc.quantity,
                            totalPrice: doc.totalPrice,
                            createdAt: doc.createdAt,
                            paymentStatus: doc.paymentStatus,
                        },
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/api/orders'
                        }
                    })
                }).catch(errormsg)
        }
        else {
            return res.status(422).json({
                message: 'Order ID is not valid!!'
            })
        }
    })
    .patch((req, res) => { //checkAuth, isCustomer
        const uid = req.params.orderId
        if (mongoose.isValidObjectId(uid)) {
            orderModel.findByIdAndUpdate(uid, { $set: req.body }, { new: true })
                .then(doc => {
                    res.status(200).json({
                        message: "Order updated successfully!!",
                        _id: uid,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/api/orders/' + uid
                        }
                    })
                }).catch(errormsg)
        }
        else {
            return res.status(422).json({
                message: 'Order ID is not valid!!'
            })
        }
    })
    .delete((req, res) => {  // checkAuth, isCustomer
        const id = req.params.orderId
        if (mongoose.isValidObjectId(id)) {
            orderModel.deleteOne({ _id: id }).then(doc => {
                res.status(200).json({
                    message: 'Order deleted successfully',
                    request: {
                        type: 'POST',
                        url: 'http://localhost:3000/api/orders',
                        body: {
                            productId: 'ID',
                            quantity: 'Number'
                        }
                    }
                })
            }).catch(errormsg)
        }
        else {
            return res.status(422).json({
                message: 'Order ID is not valid!!'
            })
        }
    })

module.exports = router