const express = require('express')
const router = express.Router();
const mongoose = require('mongoose')

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userModel = require('../models/User')

const errormsg = (err) => {
    res.status(500).json({
        error: err
    })
}

router.get('/', (req, res) => {
    userModel.find().exec().then(docs => {
        res.status(200).json({
            count: docs.length,
            users: docs.map(doc => {
                return {
                    email: doc.email,
                    password: doc.password,
                    level: doc.level,
                    _id: doc._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/api/users/' + doc._id
                    }
                }
            })
        })
    }).catch(errormsg)
})


router.get('/:userId', (req, res) => {
    if (mongoose.isValidObjectId(req.params.userId)) {
        userModel.findById(req.params.userId).exec().then(doc => {
            if (doc) {
                res.status(200).json({
                    email: doc.email,
                    password: doc.password,
                    level: doc.level,
                    _id: doc._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/api/users/login',
                        body: {
                            email: "String",
                            password: "String",
                            token: "String"
                        }
                    }
                })
            }
            else {
                res.status(404).json({
                    message: 'No valid user found for given ID'
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

router.patch('/:userId', (req, res) => {
    const id = req.params.userId
    let pwd = req.body.password
    bcrypt.hash(pwd, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({
                error: err
            })
        }
        else {
            req.body.password = hash
            if (mongoose.isValidObjectId(id)) {
                userModel.findByIdAndUpdate(id, { $set: req.body }, { new: true })
                    .then(doc => {
                        res.status(200).json({
                            message: "User updated successfully!!",
                            id: id,
                            request: {
                                type: 'GET',
                                url: 'http://localhost:3000/api/users/' + id
                            }
                        })
                    }).catch(errormsg)
            }
            else {
                return res.status(422).json({
                    message: 'User ID is not valid!!'
                })
            }
        }
    })
})

router.delete('/:userId', (req, res) => {
    if (mongoose.isValidObjectId(req.params.userId)) {
        userModel.deleteOne({ _id: req.params.userId }).exec()
            .then(user => {
                res.status(200).json({
                    message: 'User deleted successfully!!',
                    request: {
                        type: 'POST',
                        url: 'http://localhost:3000/api/users/register',
                        body: {
                            email: 'String',
                            password: 'String',
                            level: 'String'
                        }
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

router.post('/register', (req, res) => {
    userModel.find({ email: req.body.email }).exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: 'Email Already Exists!!'
                })
            }
            else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        })
                    }
                    else {
                        const user = new userModel({
                            email: req.body.email,
                            password: hash,
                            level: req.body.level
                        })
                        user.save().then(result => {
                            res.status(201).json({
                                message: 'User Registered Successfully!!'
                            })
                        }).catch(errormsg)
                    }
                })
            }
        })
})

router.post('/login', (req, res) => {
    userModel.find({ email: req.body.email }).exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(404).json({
                    message: 'Login failed!!'
                })
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Login failed!!'
                    })
                }
                if (result) {
                    const token = jwt.sign(
                        {
                            email: user[0].email,
                            userId: user[0]._id,
                            level: user[0].level
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
        }).catch(errormsg)
})

module.exports = router
