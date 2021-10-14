const express = require('express')
const router = express.Router()

const productModel = require('../models/Product')
const checkAuth = require('../middleware/checkAuth')

const errormsg = (err) => {
	res.status(500).json({
		error: err
	})
}

router.route('/')
	.get((req, res) => {
		productModel.find().then(docs => {
			const response = {
				count: docs.length,
				products: docs.map(doc => {
					return {
						_id: doc._id,
						name: doc.name,
						price: doc.price,
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

	.delete(checkAuth, (req, res) => {
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
		if (mongoose.isValidObjectId(id)) {
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
		}
		else {
			return res.status(422).json({
				message: 'User ID is not valid!!'
			})
		}
	})

	.patch(checkAuth, (req, res) => {
		const id = req.params.productId
		if (mongoose.isValidObjectId(id)) {
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
		}
		else {
			return res.status(422).json({
				message: 'User ID is not valid!!'
			})
		}
	})

	.delete(checkAuth, (req, res) => {
		const id = req.params.productId
		if (mongoose.isValidObjectId(id)) {
			productModel.findByIdAndDelete(id).then(doc => {
				res.status(200).json({
					message: "Product deleted successfully!!",
					request: {
						type: 'GET',
						url: 'http://localhost:3000/products/'
					}
				})
			}).catch(errormsg)
		}
		else {
			return res.status(422).json({
				message: 'Product ID is not valid!!'
			})
		}
	})

module.exports = router