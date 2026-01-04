import express from 'express';
import {getProducts, getProductById} from '../controllers/productController.js';

const router = express.Router();


router.route('/').get(getProducts);
router.route('/:id').get(getProductById);

// router.get('/', getProducts);
// router.get('/:id', getProductById);
// check the note for difference
export default router;