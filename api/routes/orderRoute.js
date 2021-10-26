const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const apicache = require('apicache');
let cache = apicache.middleware

const orderModel = require('../models/Order');
const productModel = require('../models/Product');
const checkAuth = require('../middleware/checkAuth');
const {
  isAdmin,
  isSeller,
  isCustomer,
  isAdminOrSeller,
} = require('../middleware/checkRoles');

const errormsg = (err) => {
  res.status(500).json({
    error: err,
  });
};

router
  .route('/')
  .get(cache('1 minute'), async (req, res) => {
    //checkAuth, isCustomer
    try {
      const docs = await orderModel.find().populate('productId').exec();
      // res.status(200).json(docs)
      res.status(200).json({
        count: docs.length,
        orders: docs.map((doc) => {
          return {
            _id: doc._id,
            product: {
              id: doc.productId._id,
              name: doc.productId.name,
              price: doc.productId.price,
              productImage: doc.productId.productImage,
            },
            quantity: doc.quantity,
            totalPrice: doc.totalPrice,
            createdAt: doc.createdAt,
            paymentStatus: doc.paymentStatus,
            request: {
              type: 'GET',
              url: 'http://localhost:3000/api/orders/' + doc._id,
            },
          };
        }),
      });
    } catch (err) {
      errormsg(err);
    }
  })
  .post(async (req, res) => {
    // checkAuth, isCustomer
    try {
      const product = await productModel.findById(req.body.productId);

      if (!product) {
        return res.status(404).json({
          message: 'Product not found!!',
        });
      }

      const order = new orderModel({
        productId: req.body.productId,
        quantity: req.body.quantity,
        totalPrice: product.price * req.body.quantity,
      });
      await order.save();

      res.status(201).json({
        message: 'Order created successfully!',
        createdOrder: {
          productId: order.productId,
          quantity: order.quantity,
          productImage: order.productImage,
        },
        totalPrice: order.totalPrice,
        createdAt: order.createdAt,
        paymentStatus: order.paymentStatus,
        _id: order._id,
        request: {
          type: 'POST',
          url: 'http://localhost:3000/api/payments/' + order._id,
        },
      });
    } catch (err) {
      console.log(err);
      errormsg(err);
    }
  });

router
  .route('/:orderId')
  .get(cache('1 minute'), async (req, res) => {
    // checkAuth, isCustomer
    if (!mongoose.isValidObjectId(req.params.orderId)) {
      return res.status(422).json({
        message: 'Order ID is not valid!!',
      });
    }
    try {
      const doc = await orderModel
        .findById(req.params.orderId)
        .populate('productId')
        .exec();

      if (!doc) {
        return res.status(404).json({
          message: 'Order not found!!',
        });
      }

      res.status(200).json({
        order: {
          _id: doc._id,
          product: {
            id: doc.productId._id,
            name: doc.productId.name,
            price: doc.productId.price,
            image: doc.productId.productImage,
          },
          quantity: doc.quantity,
          totalPrice: doc.totalPrice,
          createdAt: doc.createdAt,
          paymentStatus: doc.paymentStatus,
        },
        request: {
          type: 'GET',
          url: 'http://localhost:3000/api/orders',
        },
      });
    } catch (err) {
      errormsg(err);
    }
  })
  .patch(async (req, res) => {
    //checkAuth, isCustomer
    try {
      const { orderId } = req.params;
      if (!mongoose.isValidObjectId(orderId)) {
        return res.status(422).json({
          message: 'Order ID is not valid!!',
        });
      }

      const doc = await orderModel.findByIdAndUpdate(
        orderId,
        { $set: req.body },
        { new: true }
      );

      res.status(200).json({
        message: 'Order updated successfully!!',
        _id: orderId,
        request: {
          type: 'GET',
          url: 'http://localhost:3000/api/orders/' + orderId,
        },
      });
    } catch (err) {
      errormsg(err);
    }
  })
  .delete(async (req, res) => {
    // checkAuth, isCustomer
    try {
      const id = req.params.orderId;
      if (!mongoose.isValidObjectId(id)) {
        return res.status(422).json({
          message: 'Order ID is not valid!!',
        });
      }
      await orderModel.deleteOne({ _id: id });

      res.status(200).json({
        message: 'Order deleted successfully',
        request: {
          type: 'POST',
          url: 'http://localhost:3000/api/orders',
          body: {
            productId: 'ID',
            quantity: 'Number',
          },
        },
      });
    } catch (err) {
      errormsg(err);
    }
  });

module.exports = router;
