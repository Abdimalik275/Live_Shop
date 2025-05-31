const Users = require('./Models/Users'); // Path to your User model
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authorizeRole = require('../middlewares/authorizeRole');
const authenticateToken = require('../middlewares/authenticateToken');
const { Router } = require('express');

const router = Router(); // Initialize router

// Fetch all users (Admin only)
router.get(
  '/users',
  authenticateToken,
  authorizeRole(['admin']),
  async (req, res) => {
    try {
      const users = await Users.find().select('-password');
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Register new user
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      storename,
      idNumber,
      photoID,
      realPhoto,
      storeAddress,
      phone,
      country,
    } = req.body;

    // Check if user already exists
    const userExists = await Users.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new Users({
      name,
      email,
      password: hashedPassword,
      role,
      storename,
      idNumber,
      photoID,
      realPhoto,
      storeAddress,
      phone,
      country,
    });

    await user.save();
    res.json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const matchingPassword = await bcrypt.compare(password, user.password);
    if (!matchingPassword) {
      return res.status(401).json({ message: 'Invalid Password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: '1h' } // 1 hour expiry
    );

    res.status(200).json({ message: 'Login successful', token, user });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

// Logout


// Update Role (admin-only)


// Delete User (admin-only)


















module.exports = router;