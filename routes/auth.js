const Users = require('../Models/Users'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authorizeRole = require('../middleware/authorizeRole');
const authenticateToken = require('../middleware/authenticateToken');
const { Router } = require('express');

const router = Router(); // Initialize router

// =======================
// Fetch all users (Admin only)
// =======================
router.get(
  '/users',
  authenticateToken,
  authorizeRole('admin'),
  async (req, res) => {
    try {
      const users = await Users.find().select('-password');
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// =======================
// Register new user
// =======================
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

// =======================
// Login user
// =======================
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
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token, user });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

// =======================
// Logout
// =======================
router.post('/logout', authenticateToken, (req, res) => {
  // Note: This doesn’t actually invalidate token unless you implement token blacklist
  res.status(200).json({ message: 'Logged out successfully' });
});

// =======================
// Update User Role (Admin only)
// =======================
router.put(
  '/users/:id/role',
  authenticateToken,
  authorizeRole('admin'),
  async (req, res) => {
    try {
      const { role } = req.body;

      const updatedUser = await Users.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
      ).select('-password');

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'User role updated', user: updatedUser });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// =======================
// Delete User (Admin only)
// =======================
router.delete(
  '/users/:id',
  authenticateToken,
  authorizeRole('admin'),
  async (req, res) => {
    try {
      const deletedUser = await Users.findByIdAndDelete(req.params.id);

      if (!deletedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'User successfully deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
