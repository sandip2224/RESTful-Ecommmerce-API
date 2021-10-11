const express=require('express')
const router=express.Router();

const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')

const userModel=require('../models/User')

// @desc: User registration
// @route: POST /register
// @access: Public

router.post('/register', (req, res)=>{
    userModel.find({email: req.body.email}).exec()
    .then(user=>{
        if(user.length>=1) {
            return res.status(409).json({
                message: 'Email Already Exists!!'
            })
        }
        else{
            bcrypt.hash(req.body.password, 10, (err, hash)=>{
                if(err){
                    return res.status(500).json({
                        error: err
                    })
                }
                else{
                    const user=new userModel({
                        email: req.body.email,
                        password: hash
                    })
                    user.save()
                    .then(result=>{
                        res.status(201).json({
                            message: 'User Registered Successfully!!'
                        })
                    })
                    .catch(err=>{
                        console.log(err)
                        res.status(500).json({
                            error: err
                        })
                    })
                }
            })
        }
    })
})

// @desc: User login
// @route: POST /login
// @access: Public

router.post('/login', (req, res)=>{
    userModel.find({email: req.body.email}).exec()
    .then(user=>{
        if(user.length<1){
            return res.status(404).json({
                message: 'Login failed!!'
            })
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result)=>{
            if(err){
                return res.status(401).json({
                    message: 'Login failed!!'
                })
            }
            if(result){
                const token=jwt.sign(
                {
                    email: user[0].email,
                    userId: user[0]._id,
                },
                process.env.JWT_KEY, 
                {
                    expiresIn: "1h"
                })
                return res.status(200).json({
                    message: 'Login successful!!',
                    userId: user[0]._id,
                    token: token
                })
            }
            return res.status(401).json({
                message: 'Login failed!!'
            })
        })
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({
            error: err
        })
    })
})

// @desc: Delete existing user
// @route: DELETE /:userId
// @access: Public

router.delete('/:userId', (req, res)=>{
    userModel.remove({_id: req.params.userId}).exec()
    .then(user=>{
        res.status(200).json({
            message: 'User Deleted Successfully!!'
        })
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({
            error: err
        })
    })
})

module.exports=router
