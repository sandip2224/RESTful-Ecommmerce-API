const express=require('express')
const router=express.Router();

const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')

const userModel=require('../models/User')

/**
 * @swagger
 * components:
 *   schemas:
 *     Authorization:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: Email address required for registration
 *         password:
 *           type: string
 *           description: Password required for registration
 *     AuthResponse:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - token
 *       properties:
 *         email:
 *           type: string
 *           description: Email address required for registration
 *         password:
 *           type: string
 *           description: Password required for registration
 *         token:
 *           type: string
 *           description: The auto-generated JWT after succesful authentication
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *               $ref: '#/components/schemas/Authorization'
 *     responses:
 *       200:
 *         description: The user was successfully created
 *       401:
 *         description: The user already exists
 *       500:
 *         description: Internal server error
 */

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

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login as existing user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *               $ref: '#/components/schemas/Authorization'
 *     responses:
 *       200:
 *         description: Authentication successful
 *         contents:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       404:
 *         description: User does not exist
 *       500:
 *         description: Internal server error
 */

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

/**
 * @swagger
 * /{userId}:
 *   delete:
 *     summary: Delete an existing user with userId
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id to be deleted
 *     responses:
 *       200:
 *         description: The user has been successfully deleted
 *       500:
 *         description: Internal Server Error
 */

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
