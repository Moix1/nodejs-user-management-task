const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const logAction = require('../middleware/logAction');
const { authenticate } = require('../middleware/auth'); 
const router = express.Router();

const JWT_SECRET = 'asjhahj888'; 

// Signup route
router.post('/signup', logAction('register'), async (req, res) => {
  console.log('Signup request received:', req.body);
  try {
    const { name, email, password } = req.body;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = new User({ name, email, password: hashedPassword });

    await user.save();

    console.log('User saved:', user);
    res.status(201).send({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).send({ error: error.message });
  }
});

// Login route
router.post('/login', logAction('login'), async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt with email:', email);

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found with email:', email);
      return res.status(401).send({ error: 'Invalid email or password' });
    }
    console.log('User found:', user);

   
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return res.status(401).send({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    // Return the token to the client
    res.send({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).send({ error: error.message });
  }
});

// Authenticated user route
router.get('/user', authenticate, async (req, res) => { 
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).send({ error: 'User not found' });

    res.send(user);
  } catch (error) {
    console.error('User error:', error);
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
