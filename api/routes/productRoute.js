const express = require('express');
const router = express.Router();
const apicache = require('apicache');
let cache = apicache.middleware
const mongoose = require('mongoose');
const multer = require('multer');

const productModel = require('../models/Product');

const checkAuth = require('../middleware/checkAuth');
const checkHeaderAuth = require('../middleware/checkHeaderAuth');

const { isAdmin, isAdminOrSeller } = require('../middleware/checkRoles');

const errormsg = (err) => {
  res.status(500).json({
    error: err,
  });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg'
  ) {
    cb(null, true);
  }
  cb(null, false);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
});

router
  .route('/')
  .get(cache('1 minute'), async (req, res) => {
    try {
      const products = await productModel.find();
      const response = {
        count: products.length,
        products: products.map((product) => {
          return {
            _id: product._id,
            name: product.name,
            price: product.price,
            productImage: product.productImage,
            request: {
              type: 'GET',
              url: 'http://localhost:3000/api/products/' + product._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    } catch (err) {
      errormsg(err);
    }
  })
  .post(upload.single('productImage'), async (req, res) => {
    // checkHeaderAuth, isAdminOrSeller
    try {
      const product = new productModel({
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path,
      });
      const savedProduct = await product.save();

      res.status(201).json({
        message: 'New Product Added Successfully!!',
        createdProduct: {
          name: savedProduct.name,
          price: savedProduct.price,
          productImage: savedProduct.productImage,
          _id: savedProduct._id,
          request: {
            type: 'GET',
            url: 'http://localhost:3000/api/products/' + savedProduct._id,
          },
        },
      });
    } catch (err) {
      errormsg(err);
    }
  })

  .delete(checkAuth, isAdmin, async (req, res) => {
    try {
      await productModel.deleteMany();

      res.status(200).json({
        message: 'All products deleted successfully!!',
        request: {
          type: 'POST',
          url: 'http://localhost:3000/api/products/',
        },
      });
    } catch (err) {
      errormsg(err);
    }
  });

router
  .route('/:productId')
  .get(cache('1 minute'), async (req, res) => {
    try {
      const { productId } = req.params;
      if (!mongoose.isValidObjectId(productId)) {
        return res.status(422).json({
          message: 'User ID is not valid!!',
        });
      }

      const product = await productModel.findById(productId);

      if (!product) {
        return res.status(404).json({
          message: 'No valid product found for given ID',
        });
      }
      res.status(200).json({
        name: product.name,
        price: product.price,
        productImage: product.productImage,
        _id: product._id,
        request: {
          type: 'GET',
          url: 'http://localhost:3000/api/products/' + product._id,
        },
      });
    } catch (err) {
      errormsg(err);
    }
  })
  .patch(
    checkHeaderAuth,
    isAdminOrSeller,
    upload.single('productImage'),
    async (req, res) => {
      try {
        const { productId } = req.params;
        if (!mongoose.isValidObjectId(productId)) {
          return res.status(422).json({
            message: 'User ID is not valid!!',
          });
        }

        await productModel.findByIdAndUpdate(
          productId,
          { $set: req.body },
          { new: true }
        );

        res.status(200).json({
          message: 'Product updated successfully!!',
          id: productId,
          request: {
            type: 'GET',
            url: 'http://localhost:3000/api/products/' + productId,
          },
        });
      } catch (err) {
        errormsg(err);
      }
    }
  )
  .delete(checkAuth, isAdmin, async (req, res) => {
    try {
      const { productId } = req.params;
      if (!mongoose.isValidObjectId(productId)) {
        return res.status(422).json({
          message: 'Product ID is not valid!!',
        });
      }

      await productModel.findByIdAndDelete(productId);

      res.status(200).json({
        message: 'Product deleted successfully!!',
        request: {
          type: 'GET',
          url: 'http://localhost:3000/api/products/',
        },
      });
    } catch (err) {
      errormsg(err);
    }
  });

module.exports = router;
