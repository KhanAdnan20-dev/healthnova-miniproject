const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Correctly require the library

// Function to generate a JWT
const generateToken = (id, name, email) => {
    return jwt.sign({ id, name, email }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Controller for user registration
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }
    try {
        const [userExists] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (userExists.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const [result] = await db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
        const newUser = { id: result.insertId, name, email };
        res.status(201).json({
            message: 'User registered successfully',
            user: newUser,
            token: generateToken(newUser.id, newUser.name, newUser.email),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// Controller for user login
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                message: 'Login successful',
                user: { id: user.id, name: user.name, email: user.email },
                token: generateToken(user.id, user.name, user.email),
            });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

module.exports = { registerUser, loginUser };