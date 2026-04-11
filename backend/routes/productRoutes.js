import express from 'express';
import {getProducts, getTopProducts, getProductById, createProduct, updateProduct, deleteProduct, createProductReview} from '../controllers/productController.js';
import {protect, admin} from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getProducts).post(protect, admin, createProduct);
router.route('/top').get(getTopProducts); // this route must be defined before the route with :id, otherwise it will be treated as a product id and cause an error
router.route('/:id').get(getProductById).put(protect, admin, updateProduct).delete(protect, admin, deleteProduct);
router.route('/:id/reviews').post(protect, createProductReview);

// router.get('/', getProducts);
// router.get('/:id', getProductById);
// check the note for difference
export default router;