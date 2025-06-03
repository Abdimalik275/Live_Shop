const express = require ('express');
const router = express.Router();
const Product = require('../Models/Product');
const authenticateToken = require ('../Middleware/authenticateToken');
const authorizeRole = require ('../Middleware/authorizeRole');
const upload = require('../middleware/upload'); 
const asyncHandler = require('../middleware/asyncHandler');


// Add new product (admin/seller only)
router.post(
    "/", 
    authenticateToken,
    authorizeRole (['admin', 'seller']),
    upload.array("image", 12),
    asyncHandler(async (req, res) =>{
        const {name, price, description, category, stock } = req.body;

    // Collect image paths from multer
    const images = req.files.map(file => file.path);

    const product = new Product({
        name, 
        price,
        description,
        category,
        stock: stock || 0,
        images,
        owner : req.user._id
    });
    await product.save();
    res.status(201).json({message: "Product added successfully"});
    
})

);


// Update product by ID (admin/seller only)
router.put(
    '/:id',
    authenticateToken,
    authorizeRole('admin', 'seller'),
    upload.array('images', 5),
    asyncHandler(async (req, res) => {
      const { name, description, price, category, stock } = req.body;
      const product = await Product.findById(req.params.id);
  
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
    
      // Only owner or admin can update
      if (product.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }

// Update fields if provided
if (name )product.name = name ;
if (description )product.description = description ;
if (price )product.price = price ;
if (category )product.category = category ;
if (stock )product.stock = stock ;
  // If images uploaded, replace images array
  if (req.files.length > 0) {
    product.images = req.files.map(file => file.path);

    await product.save();
    res.json({ message: "Product updated successfully"});
    } else {
      res.json({ message: "No changes made"});
      }
      })
      );
  
// Delete product by ID (admin/seller only)
router.delete(
  '/:id',
  authenticateToken,
  authorizeRole('admin', 'seller'),
  asyncHandler(async( req, res)=>{
    const product = await product.findById(req.params.id)
    if (!product){
      return res.json({ message: 'Product not found'})  
    }
    //// Only owner or admin can delete
    if(product.owner.toString() !== req.user.id && req.user.role !== 'admin'){
      return res.json({ message: ' You are a not  authorized'})
    }
     await product.remove()
     res.json({ message: 'Product deleted successfully'})
  })
)


// Get all products (public)
router.get('/', asyncHandler(async (req, res) =>{
  const product = await product.find().populate( 'owner', 'name email' );
  res.json(product);
  }));


// Get product by ID (public)
router .get('/:id', asyncHandler(async(req, res)=>{
  const product = await product.findById(req.params.id).populate( 'owner', 'name email' );
  if (product){
    res.json(product);
  }
}))






module .exports = router; 