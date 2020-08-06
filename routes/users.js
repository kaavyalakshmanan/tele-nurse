/* REGISTERING A NEW USER
   Credits to help us understand how to use JWT and bcryptjs: https://blog.bitsrc.io/build-a-login-auth-app-with-mern-stack-part-1-c405048e3669
*/

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');

// User Model
const User = require('../models/userModel');

/* @route   POST /users
   @desc    Register a new UserDasboard
   @access  Public */

router.post('/', (req, res) => {
    const {email, username, password} = req.body;

    // If User Dasboard does not input username, email, or password, send 400 response
    if (!username || !email || !password) {
        return res.status(400).json({msg: 'Please enter all fields'});
    }

    // If User Dasboard is already registered, send 400 response
    User.findOne({username: username, email: email})
        .then(user => {
            if (user) return res.status(400).json({msg: 'User already exists'});

            // Create new User Dasboard object with req.body that's passed in from axios post request
            const newUser = new User(req.body);

            // Salt & hash password to make more secure
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    // Set User Dasboard's password to hashed password
                    newUser.password = hash;
                    // Dave User Dasboard to database
                    newUser.save()
                        .then(user => {
                            // Sign User Dasboard in using JWT token
                            jwt.sign(
                                {id: user.id},
                                config.get('jwtSecret'),
                                // Keep User Dasboard logged in for 1 hour
                                {expiresIn: 3600},
                                (err, token) => {
                                    if (err) throw err;
                                    // Send JSON response with relevant UserDasboard info and newly created authorization token
                                    res.json({
                                        token,
                                        user: {
                                            id: user.id,
                                            email: user.email,
                                            username: user.username
                                        }
                                    });
                                });
                        })
                .catch(err => {
                        return res.status(400).json({msg: 'User already exists'});
                    })
                });
            });
        })
        .catch(err => {
            return res.status(400).json({msg: 'Unable to create this user.'});
        })
});


module.exports = router;