const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const key = require('../../config/keys').secretOrKey;
const express = require('express');
const router = express.Router();
const {
    check,
    validationResult
} = require('express-validator/check');


// @route   POST api/users/
// @desc    Register a user
// @access  Public route
router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({
        min: 6
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    const {
        name,
        email,
        password
    } = req.body;
    try {
        // See if user exists
        let user = await User.findOne({
            email
        });
        if (user) {
            return res.status(400).json({
                errors: [{
                    msg: 'User already exists'
                }]
            });
        }
        //Get users gravatar
        const avatar = gravatar.url(email, {
            s: 200,
            r: 'pg',
            d: 'mm'
        });

        user = new User({
            name,
            email,
            avatar,
            password
        });
        //Encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        //Return jsonwebtoken
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, key, {
            expiresIn: 3600000
        }, (err, token) => {
            if (err) {
                throw err;
            } else {
                res.json({
                    token
                });
            }
        });


    } catch (err) {
        console.log(err);
        res.status(500).send('Server error');
    }


});

module.exports.userRoute = router;