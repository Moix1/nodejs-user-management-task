const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const logAction = require('../middleware/logAction');

const router = express.Router();

// File upload setup for profile pictures
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile_pictures/');
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// Create a new user (Admin only)
router.post('/', [authenticate, authorize(['admin']), logAction('create_user')], async (req, res) => {
  const { name, email, password, age, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ error: 'User already exists' });
    }

    const newUser = new User({ name, email, password, age, role });
    await newUser.save();
    res.status(201).send(newUser);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get all users (Admin only)
router.get('/', [authenticate, authorize(['admin'])], async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get a specific user (Authenticated users)
router.get('/:id', authenticate, async (req, res) => {
  try {
    // Only allow users to fetch their own profile unless admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).send({ error: 'Access denied.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    res.send(user);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Update a user (Admin can update any user, users can update their own profile)
router.put('/:id', [authenticate, logAction('update_user')], async (req, res) => {
  const { name, email, age, role } = req.body;
  const userId = req.params.id;

  try {
    // Allow admins to update any user, users can only update their own profile
    if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).send({ error: 'Access denied.' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, email, age, role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    res.send(user);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Delete a user (Admin only)
router.delete('/:id', [authenticate, authorize(['admin']), logAction('delete_user')], async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    res.send({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Update profile picture (Authenticated users)
router.put('/me/profile-picture', [authenticate, upload.single('profilePicture'), logAction('upload_profile_picture')], async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: req.file.path.replace('src/', '') }, // Adjust the path to be relative to your server
      { new: true }
    );

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    res.send(user);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
