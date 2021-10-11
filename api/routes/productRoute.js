const express=require('express')
const router=express.Router()

const productModel=require('../models/Product')
const checkAuth=require('../middleware/checkAuth')

// @desc: Get all products
// @route: GET /products
// @access: Public

router.get('/', (req, res)=>{
    productModel.find().then(docs=>{
        const response={
            count: docs.length,
            products: docs.map(doc=>{
                return{
                    name: doc.name,
                    price: doc.price,
                    _id: doc._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/'+doc._id
                    }
                }
            })
        }
        res.status(200).json(response) 
    }).catch(err=>{
        res.status(500).json({
            error: err
        })
    })
})

// @desc: Get a single product
// @route: GET /products/:productId
// @access: Public

router.get('/:productId', (req, res)=>{
    const id=req.params.productId;
    productModel.findById(id).then(doc=>{
        if(doc){
            res.status(200).json({
                name: doc.name,
                price: doc.price,
                _id: doc._id,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/'+doc._id
                }
            })
        }
        else{
            res.status(404).json({
                message: 'No valid product found for given ID'
            })
        }
    }).catch((err)=>{
        res.status(500).json({
            error: err
        })
    })
})

// @desc: Create a new Product
// @route: POST /products
// @access: Protected

router.post('/', checkAuth, (req, res)=>{
    const product=new productModel({
        name: req.body.name,
        price: req.body.price
    })
    product.save().then((doc)=>{
        res.status(201).json({
            message: 'New Product Added Successfully!!',
            createdProduct: {
                name: doc.name,
                price: doc.price,
                _id: doc._id,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/'+doc._id
                }
            }
        })
    }).catch((err)=>{
        res.status(500).json({
            error: err
        })
    })
})

module.exports=router