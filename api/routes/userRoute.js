const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const apicache = require('apicache');
let cache = apicache.middleware


const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userModel = require('../models/User');

const errormsg = (err) => {
  res.status(500).json({
    error: err,
  });
};

router.get('/',cache('1 minute'), async (req, res) => {
  try {
    const users = await userModel.find().exec();

    res.status(200).json({
      count: users.length,
      users: users.map((user) => {
        return {
          email: user.email,
          password: user.password,
          level: user.level,
          _id: user._id,
          request: {
            type: 'GET',
            url: 'http://localhost:3000/api/users/' + user._id,
          },
        };
      }),
    });
  } catch (err) {
    errormsg(err);
  }
});

router.get('/:userId', cache('1 minute'), async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(422).json({
        message: 'User ID is not valid!!',
      });
    }
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'No valid user found for given ID',
      });
    }

    res.status(200).json({
      email: user.email,
      password: user.password,
      level: user.level,
      _id: user._id,
      request: {
        type: 'GET',
        url: 'http://localhost:3000/api/users/login',
        body: {
          email: 'String',
          password: 'String',
          token: 'String',
        },
      },
    });
  } catch (err) {
    errormsg(err);
  }
});

router.patch('/:userId', async (req, res) => {
  const id = req.params.userId;
  const pwd = req.body.password;

  bcrypt.hash(pwd, 10, async (err, hash) => {
    if (err) {
      return res.status(500).json({
        error: err,
      });
    }

    req.body.password = hash;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(422).json({
        message: 'User ID is not valid!!',
      });
    }

    try {
      await userModel.findByIdAndUpdate(id, { $set: req.body }, { new: true });
      res.status(200).json({
        message: 'User updated successfully!!',
        id: id,
        request: {
          type: 'GET',
          url: 'http://localhost:3000/api/users/' + id,
        },
      });
    } catch (err) {
      errormsg(err);
    }
  });
});

router.delete('/:userId', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.userId)) {
    return res.status(422).json({
      message: 'User ID is not valid!!',
    });
  }

  try {
    await userModel.deleteOne({ _id: req.params.userId });

    res.status(200).json({
      message: 'User deleted successfully!!',
      request: {
        type: 'POST',
        url: 'http://localhost:3000/api/users/register',
        body: {
          email: 'String',
          password: 'String',
          level: 'String',
        },
      },
    });
  } catch (err) {
    errormsg(err);
  }
});

router.post('/register', async (req, res) => {
  try {
    const user = await userModel.findOne({email: { $eq: req.body.email } });

    if (user) {
      return res.status(409).json({
        message: 'Email Already Exists!!',
      });
    }

    bcrypt.hash(req.body.password, 10, async (err, hash) => {
      if (err) {
        return res.status(500).json({
          error: err,
        });
      }

      const user = new userModel({
        email: req.body.email,
        password: hash,
        level: req.body.level,
      });
      await user.save();

      res.status(201).json({
        message: 'User Registered Successfully!!',
      });
    });
  } catch (err) {
    errormsg(err);
  }
});

router.post('/login', async (req, res) => {
  try {
    const user = await userModel.findOne({ email: { $eq: req.body.email } });

    if (!user) {
      return res.status(404).json({
        message: 'Login failed!!',
      });
    }

    bcrypt.compare(req.body.password, user.password, (err, result) => {
      if (err) {
        return res.status(401).json({
          message: 'Login failed!!',
        });
      }

      const token = jwt.sign(
        {
          email: user.email,
          userId: user._id,
          level: user.level,
        },
        process.env.JWT_KEY,
        {
          expiresIn: '1h',
        }
      );

      return res.status(200).json({
        message: 'Login successful!!',
        userId: user._id,
        token: token,
      });
    });
  } catch (err) {
    errormsg(err);
  }
});

module.exports = router;
