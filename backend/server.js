import path from 'path';
import express from 'express';

import dotenv from 'dotenv';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/OrderRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import cookieParser from 'cookie-parser';
import uploadRoutes from './routes/uploadRoutes.js';
import e from 'express';

dotenv.config();

const port = process.env.PORT || 5001;
const app = express();

connectDB();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to parse cookies
app.use(cookieParser());

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes); // all requests to /api/users will be handled by userRoutes
app.use('/api/orders', orderRoutes);
app.use('/api/config/paypal', (req, res) => {
  res.json({ clientId: process.env.PAYPAL_CLIENT_ID || '' });
});
app.use('/api/upload', uploadRoutes);

const __dirname = path.resolve(); // get the absolute path of the current directory
app.use('/uploads', express.static(path.join(__dirname, '/uploads'))); // serve the uploads folder as static files

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/frontend/build'))); // serve the frontend build folder as static files

  app.get('/*splat', (req, res) => {
    res.sendFile(path.join(__dirname, '/frontend/build', 'index.html'));
  });

}else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
