const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const { parsePhoneNumberFromString } = require('libphonenumber-js');

// Register
router.post('/register', async (req, res) => {
    const { username, email, password, phoneNumber, countryCode, role } = req.body;

    try {
        // Validate phone number
        const formattedPhoneNumber = `${countryCode}${phoneNumber}`;
        const phoneNumberObj = parsePhoneNumberFromString(formattedPhoneNumber);

        if (!phoneNumberObj || !phoneNumberObj.isValid()) {
            return res.status(400).json({ message: 'Invalid phone number' });
        }

        // Format phone number to E.164 format
        const e164PhoneNumber = phoneNumberObj.format('E.164');

        // Hash password
        const hashPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashPassword,
            phoneNumber: e164PhoneNumber,
            countryCode,
            role: role || 'user'
        });

        await newUser.save();
        res.json({ message: 'User registered!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1hr' });

     
        res.json({
            token,
            role: user.role  // Sending the role along with the token
        });

    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: error.message });
    }
});


// Logout Route
router.post('/logout', (req, res) => {
    res.json({ message: 'Logout successful' });
});

module.exports = router;
