const User = require("../Models/UserModels");
const asyncHandler = require('express-async-handler');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');

const registerUserController = asyncHandler(async(req, res) => {
    const { username, email, password, role } = req.body;
    
    // Validate role
    if (!['Passenger', 'Rider'].includes(role)) {
        res.status(400);
        throw new Error('Invalid role. Must be either Passenger or Rider');
    }

    // Check for existing user with same email or username
    const existingUser = await User.findOne({
        $or: [
            { email: email },
            { username: username }
        ]
    });

    if (existingUser) {
        res.status(400);
        if (existingUser.email === email) {
            throw new Error('Email already registered');
        } else {
            throw new Error('Username already taken');
        }
    }
    
    const user = await User.create({
        username,
        email,
        role,
        password,
        location: {
            type: 'Point',
            coordinates: [0, 0] // Default coordinates [longitude, latitude]
        }
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            Username: user.username,
            email: user.email,
            role: user.role,
            isAvalible: role === 'Rider' ? true : undefined,
            token: generateToken(user._id, user.role)
        });
    }
});

const loginController = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });
    
    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role)
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
});

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWTOKEN, { expiresIn: '30d' });
};

module.exports = {
    registerUserController,
    loginController
};