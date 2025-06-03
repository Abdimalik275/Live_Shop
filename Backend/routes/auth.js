// routes/userRoutes.js
const Users = require('../Models/Users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authorizeRole = require('../middleware/authorizeRole');
const authenticateToken = require('../middleware/authenticateToken');
const asyncHandler = require('../middleware/asyncHandler');
const { Router } = require('express');

const router = Router();

// =======================
// Fetch all users (Admin only)
// =======================
router.get(
  '/users',
  authenticateToken,
  authorizeRole('admin'),
  asyncHandler(async (req, res) => {
    const users = await Users.find().select('-password');
    res.json(users);
  })
);

// =======================
// Register new user
// =======================
router.post(
  '/register',
  asyncHandler(async (req, res) => {
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

    const userExists = await Users.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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
    res.status(201).json({ message: 'User created successfully' });
  })
);

// =======================
// Login user
// =======================
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await Users.findOne({ email });
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const matchingPassword = await bcrypt.compare(password, user.password);
    if (!matchingPassword) {
      res.status(401);
      throw new Error('Invalid Password');
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token, user });
  })
);

// =======================
// Logout
// =======================
router.post(
  '/logout',
  authenticateToken,
  asyncHandler(async (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
  })
);

// =======================
// Update User Role (Admin only)
// =======================
router.put(
  '/users/:id/role',
  authenticateToken,
  authorizeRole('admin'),
  asyncHandler(async (req, res) => {
    const { role } = req.body;

    const updatedUser = await Users.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404);
      throw new Error('User not found');
    }

    res.json({ message: 'User role updated', user: updatedUser });
  })
);

// =======================
// Delete User (Admin only)
// =======================
router.delete(
  '/users/:id',
  authenticateToken,
  authorizeRole('admin'),
  asyncHandler(async (req, res) => {
    const deletedUser = await Users.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      res.status(404);
      throw new Error('User not found');
    }

    res.json({ message: 'User successfully deleted' });
  })
);

module.exports = router;
