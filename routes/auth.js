const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// AUTHENTICATED EXISTING USER

// User Model
const User = require("../models/userModel");

/* @route  POST /auth
   @desc   Authenticate eixsting user
   @access Public */
   
router.post('/', (req, res) => {
    const {username, password} = req.body;

    // Simple validation
    if (!username || !password) {
        return res.status(400).json({msg: 'Please enter all fields'});
    }

    // Check for existing user
    User.findOne({username})
        .then(user => {
            if (!user) return res.status(400).json({msg: 'User does not exist'});

            // Compare plain-text password sent with body request to hash password in db

            // Validate password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (!isMatch) return res.status(400).json({msg: 'Invalid credentials'});

                    jwt.sign(
                        {id: user.id},
                        config.get('jwtSecret'),
                        {expiresIn: 3600}, 
                        (err, token) => {
                            if (err) throw err;
                            res.json({
                                token,
                                user: {
                                    id: user.id,
                                    name: user.name,
                                    username: user.username,
                                    email: user.email
                                }
                            })
                        }
                    )
                })
        })
}); 

// JWT Authentication is stateless, need to constantly validate user that's logged in on frontend

/* @route  GET /auth/user
   @desc   Get user data --> Validate user with token
   @access Private */

    router.get('/user', auth, (req, res) => {
        User.findById(req.user.id)
            // Password does not get returned
            .select('-password')
            .then(user => res.json(user));
    });

/* @route  PUT /auth/user
   @desc   Put request to update an existing user
   @access Private */
   
router.put('/user', auth, (req, res) => {
    User.findById(req.user.id, (err, updatedUser) => {
        if (!updatedUser) res.status(404).json({msg: "User not found"})
        else {
            updatedUser.name = req.body.name;
            updatedUser.email = req.body.email;
            updatedUser.username = req.body.username;
            updatedUser.password = req.body.password;
            updatedUser.profilePicture = req.body.profilePicture;
            updatedUser.lastUpdate = req.body.lastUpdate;
            updatedUser.images = req.body.images;
            updatedUser.appointments = req.body.appointments;
            updatedUser.messages = req.body.messages;
            updatedUser.documents = req.body.documents;

               // Create salt and hash
               bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(updatedUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    updatedUser.password = hash;
                    updatedUser.save()
                        .then(user => {

                            jwt.sign(
                                {id: user.id},
                                config.get('jwtSecret'),
                                {expiresIn: 3600},
                                (err, token) => {
                                    if (err) throw err;
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
                        });
                });
            });

            updatedUser.save()
                .then(updatedUser => {
                    res.status(200).json({msg: "User has been successfully updated!"})
                })
                .catch(err => {
                    res.status(404).json({msg: "There was an issue updating the user"})
                })

        }
    })
})



module.exports = router;