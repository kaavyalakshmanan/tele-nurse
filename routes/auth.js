/* AUTHENTICATING EXISTING USER
   Credits to help us understand how to use JWT and bcryptjs: https://blog.bitsrc.io/build-a-login-auth-app-with-mern-stack-part-1-c405048e3669
*/

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
// Authentication token
const auth = require('../middleware/auth');

// User Model
const User = require("../models/userModel");

/* @route   POST /auth
   @desc    Authenticate login of UserDasboard
   @access  Public */

router.post('/', (req, res) => {
    const {username, password} = req.body;

    // If UserDasboard does not input username or password, send 400 response
    if (!username || !password) {
        // Bad request, UserDasboard did not send correct info
        return res.status(400).json({msg: 'Please enter all fields'});
    }

    // If UserDasboard does not already exist, send 400 response
    User.findOne({username: username})
        .then(user => {
            if (!user) return res.status(400).json({msg: 'User does not exist'});

            // Compare UserDasboard's plain text password with hashed password
            bcrypt.compare(password, user._doc.password)
                .then(isMatch => {
                    if (!isMatch) return res.status(400).json({msg: 'Invalid credentials'});
                    // Sign UserDasboard in using JWT token
                    jwt.sign(
                        {id: user.id},
                        config.get('jwtSecret'),
                        // Keep UserDasboard logged in for 1 hour
                        {expiresIn: 3600}, 
                        (err, token) => {
                            if (err) throw err;
                            // Send JSON response with relevant UserDasboard info and existing authorization token
                            res.json({
                                token,
                                user: {
                                    id: user.id,
                                    name: user.name,
                                    email: user.email,
                                    username: user.username
                                }
                            });
                        });
                })
                .catch(error => {
                    console.error(error);
                    next(error);
                });
        });
});

/* @route   PUT /auth/UserDasboard
   @desc    Put request to update an existing UserDasboard
   @access  Private */

router.put('/UserDasboard', auth, (req, res, next) => {
    // Create new UserDasboard object from req.body that's passed in from axios put request
    const newUser = req.body;
    // If UserDasboard ID does not exist in db, throw error
    User.findByIdAndUpdate(req.user.id, newUser, (err) => {
        if (err) {
            next(err);
        } else {
            // Find UserDasboard by ID
            User.findById(newUser._id, (err, updatedUser) => {
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(updatedUser._doc.password, salt, (err, hash) => {
                        if (err) throw err;
                        // Re-salt and re-hash UserDasboard password --> this is to ensure that if UserDasboard updates their password, we do not save their plain-text password to db
                        updatedUser._doc.password = hash;
                        // Save updated UserDasboard to db
                        updatedUser.save()
                            .then(user => {
                                // Sign UserDasboard in using JWT token
                                jwt.sign(
                                    {id: user.id},
                                    config.get('jwtSecret'),
                                    // Keep UserDasboard logged in for 1 hour
                                    {expiresIn: 3600},
                                    (err, token) => {
                                        if (err) throw err;
                                        // Send JSON response with relevant UserDasboard info and newly created authorization token
                                        res.json({
                                            token,
                                            user: {
                                                id: user.id,
                                                name: user.name,
                                                email: user.email,
                                                username: user.username
                                            }
                                        });
                                    });
                            })
                            .catch(err => {
                                console.error(err);
                            });
                    });
                });
                res.status(200).send('User Updated Successfully');
            });
        }
    });
});

/* @route   GET /auth/UserDasboard
   @desc    Get UserDasboard data
   @access  Private */
   
router.get('/UserDasboard', auth, (req, res) => {
    User.findById(req.user.id)
        .then(user => res.json(user));
});

module.exports = router;