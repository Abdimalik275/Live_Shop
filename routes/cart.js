const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const asyncHandler = require('../middleware/asyncHandler');
const Cart = require('../models/cart');
const Product = require('../models/product');





// Get the user cart
router.get(
  '/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    // Find cart by user id, populate product details for each item
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart) {
      // If no cart exists, create a new empty cart for the user
      cart = new Cart({ user: req.user._id, items: [] });
      await cart.save();
      return res.status(200).json({ message: 'New cart created', cart });
    }

    // Return the existing cart
    return res.status(200).json(cart);
  })
);



// Add product to cart
router.post(
  '/add',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;

    // Basic input validation
    if (!productId || !quantity || typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({ message: 'Please provide valid productId and quantity > 0' });
    }

    // Verify the product exists in the database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find user's cart or create new one if it doesn't exist
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if product already in cart
    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

    if (itemIndex > -1) {
      // If product exists, increment quantity
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Else, add new item to cart
      cart.items.push({ product: productId, quantity });
    }

    // Save cart to database (persistent storage)
    await cart.save();

    // Respond with updated cart
    return res.status(200).json({ message: 'Product added to cart  ', cart });
  })
);



// updat product quantity in cart
router.put(
  '/update',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({ message: 'Please provide valid productId and quantity > 0' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    // Update the quantity
    cart.items[itemIndex].quantity = quantity;

    await cart.save();

    return res.status(200).json({ message: 'Cart updated successfully', cart });
  })
);



// delete product from cart
router.delete(
  '/remove/:productId',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Remove the product from cart items array
    cart.items = cart.items.filter((item) => item.product.toString() !== productId);

    await cart.save();

    return res.status(200).json({ message: 'Product removed from cart', cart });
  })
);




// clear the cart
router.delete(
  '/clear',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = []; // Empty the cart
    await cart.save();

    return res.status(200).json({ message: 'Cart cleared', cart });
  })
);

module.exports = router;
