const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const apicache = require('apicache');
let cache = apicache.middleware

const orderModel = require('../models/Order');
const paymentModel = require('../models/Payment');

const sendMail1 = require('../utils/sendMail');

const checkAuth = require('../middleware/checkAuth');

const { isAdminOrCustomer } = require('../middleware/checkRoles');

const errormsg = (err) => {
  res.status(500).json({
    error: err,
  });
};

router.get('/', cache('1 minute'), async (req, res) => {
  // checkAuth
  try {
    const docs = await paymentModel.find().populate('orderId').exec();
    res.status(200).json({
      count: docs.length,
      payments: docs.map((doc) => {
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
            url: 'http://localhost:3000/api/payments/' + doc._id,
          },
        };
      }),
    });
  } catch (err) {
    errormsg(err);
  }
});

router.get('/:paymentId', cache('1 minute'), async (req, res) => {
  // checkAuth
  try {
    const { paymentId } = req.params;
    if (!mongoose.isValidObjectId(paymentId)) {
      return res.status(422).json({
        message: 'Payment ID is not valid!!',
      });
    }

    const doc = await paymentModel
      .findById(paymentId)
      .populate('orderId')
      .exec();

    if (!doc) {
      return res.status(404).json({
        message: 'No confirmed payment found for given ID',
      });
    }

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
        url: 'http://localhost:3000/api/payments/' + doc._id,
      },
    });
  } catch (err) {
    errormsg(err);
  }
});

router.post('/', async (req, res) => {
  //checkAuth, isAdminOrCustomer
  try {
    const doc = await orderModel.findById(req.body.orderId).exec();

    if (!doc) {
      return res.status(404).json({
        message: 'Payment failed! Order not found!!',
      });
    }

    if (doc.paymentStatus === 'CONFIRMED') {
      return res.status(400).json({
        message: 'Invalid request! Payment already processed!!',
      });
    }

    if (
      !req.body ||
      !req.body.address ||
      !req.body.pin ||
      !req.body.state ||
      !req.body.cardNumber ||
      !req.body.email
    ) {
      return res.status(404).json({
        error: 'Required fields are missing!!',
      });
    }

    const payment = new paymentModel({
      orderId: req.body.orderId,
      address: req.body.address,
      pin: req.body.pin,
      state: req.body.state,
      cardNumber: req.body.cardNumber,
    });
    await payment.save();

    sendMail1(req.body.email, req.body.address, req.body.pin, req.body.state);

    const updatedOrder = await orderModel.findByIdAndUpdate(
      req.body.orderId,
      { $set: { paymentStatus: 'CONFIRMED' } },
      { new: true }
    );
    res.status(200).json({
      order: {
        message: "Payment confirmed! Your order is on it's way!!",
        _id: updatedOrder._id,
        product: {
          id: updatedOrder.productId._id,
          name: updatedOrder.productId.name,
          price: updatedOrder.productId.price,
          image: updatedOrder.productId.productImage,
        },
        quantity: updatedOrder.quantity,
        totalPrice: updatedOrder.totalPrice,
        paymentStatus: updatedOrder.paymentStatus,
      },
      request: {
        type: 'GET',
        url: 'http://localhost:3000/api/orders',
      },
    });
  } catch (err) {
    errormsg(err);
  }
});

module.exports = router;
