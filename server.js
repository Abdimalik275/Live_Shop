const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');
const productRouter = require('./routes/product');
 const cartRouter = require('./routes/cart');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json()); // Parse incoming JSON

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);


// Global Error Handler (MUST be last)
app.use(errorHandler);

// Default route
app.get('/', (req, res) => res.send('API is running...'));

// Start server
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
