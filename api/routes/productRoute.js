const express = require('express')
const router = express.Router()

const productModel = require('../models/Product')
const checkAuth = require('../middleware/checkAuth')

const errormsg = (err) => {
	res.status(500).json({
		error: err
	})
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the product
 *         name:
 *           type: string
 *           description: The title of the product
 *         price:
 *           type: number
 *           description: The price of the product
 *     ProductAuth:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         name:
 *           type: string
 *           description: The title of the product
 *         price:
 *           type: number
 *           description: The price of the product
 *         token:
 *           type: string
 *           description: The auto-generated JWT after successful login
 */

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: The shopping REST API
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Returns the list of all the products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: The list of the products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a single product by unique id
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product id
 *     responses:
 *       200:
 *         description: The product description by id
 *         contents:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: No valid product found for the given id
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new Product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *               $ref: '#/components/schemas/ProductAuth'
 *     responses:
 *       200:
 *         description: The book was successfully created
 *       500:
 *         description: Internal server error
 */

router.route('/')
	.get((req, res) => {
		productModel.find().then(docs => {
			const response = {
				count: docs.length,
				products: docs.map(doc => {
					return {
						name: doc.name,
						price: doc.price,
						_id: doc._id,
						request: {
							type: 'GET',
							url: 'http://localhost:3000/products/' + doc._id
						}
					}
				})
			}
			res.status(200).json(response)
		}).catch(errormsg)
	})

	.post(checkAuth, (req, res) => {
		const product = new productModel({
			name: req.body.name,
			price: req.body.price
		})
		product.save().then((doc) => {
			res.status(201).json({
				message: 'New Product Added Successfully!!',
				createdProduct: {
					name: doc.name,
					price: doc.price,
					_id: doc._id,
					request: {
						type: 'GET',
						url: 'http://localhost:3000/products/' + doc._id
					}
				}
			})
		}).catch(errormsg)
	})

	.delete((req, res) => {
		productModel.deleteMany().then(doc => {
			res.status(200).json({
				message: "All products deleted successfully!!",
				request: {
					type: 'POST',
					url: 'http://localhost:3000/products/'
				}
			})
		}).catch(errormsg)
	})


router.route('/:productId')
	.get((req, res) => {
		const id = req.params.productId;
		productModel.findById(id).then(doc => {
			if (doc) {
				res.status(200).json({
					name: doc.name,
					price: doc.price,
					_id: doc._id,
					request: {
						type: 'GET',
						url: 'http://localhost:3000/products/' + doc._id
					}
				})
			}
			else {
				res.status(404).json({
					message: 'No valid product found for given ID'
				})
			}
		}).catch(errormsg)
	})

	.patch((req, res) => {
		const id = req.params.productId
		productModel.findByIdAndUpdate(id, { $set: req.body }, { new: true })
			.then(doc => {
				res.status(200).json({
					message: "Product updated successfully!!",
					id: id,
					request: {
						type: 'GET',
						url: 'http://localhost:3000/products/' + id
					}
				})
			}).catch(errormsg)
	})

	.delete((req, res) => {
		const id = req.params.id
		productModel.findByIdAndDelete(id).then(doc => {
			res.status(200).json({
				message: "Product deleted successfully!!",
				request: {
					type: 'GET',
					url: 'http://localhost:3000/products/'
				}
			})
		}).catch(errormsg)
	})

module.exports = router