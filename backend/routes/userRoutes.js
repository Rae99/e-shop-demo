import express from 'express';

import {registerUser, authUser, logoutUser, getUserProfile, updateUserProfile, getUsers, getUserById, deleteUser, updateUser } from '../controllers/userController.js';

import { protect, admin } from '../middleware/authMiddleware.js'; 

const router = express.Router();

router.route('/').post(registerUser).get(protect, admin, getUsers);
router.route('/:id').get(protect, admin, getUserById).delete(protect, admin, deleteUser).put(protect, admin, updateUser);
router.post('/login', authUser);
router.post('/logout', logoutUser);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

export default router;