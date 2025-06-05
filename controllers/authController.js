const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Signup function - register a new user
const signup = async (req, res) => {
    try {
        const {username, password} = req.body;
        if (!username || !password) {
            return res.status(400).json({message: 'Username and password are required'});
        }
        const existingUser = await User.findOne({username});
        if (existingUser) {
            return res.status(409).json({message: 'Username already exists'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({username, password: hashedPassword});
        await newUser.save();

        return res.status(201).json({message: 'User created successfully'});
    } catch (error) {
        return res.status(500).json({message: 'Signup error', error: error.message});
    }
}

// Login function - authenticate a user and return a JWT
const login = async (req, res) => { 
    try {
        const {username, password} = req.body;
        if (!username || !password) {
            return res.status(400).json({message: 'Username and password are required'});
        }

        const user = await User.findOne({username});
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({message: 'Invalid credentials'});
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '1h'});
        return res.status(200).json({token});
    } catch (error) {
        return res.status(500).json({message: 'Login error', error: error.message});
    }
}

module.exports = {signup, login};