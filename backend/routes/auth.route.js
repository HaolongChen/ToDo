import express from 'express';
import { signup, signin, logout, getUser, changePassword, updateProfile } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
const router = express.Router();

router.get('/user', authMiddleware, getUser);
router.post('/signup', signup);
router.post('/signin', signin);
router.post('/logout', logout);
router.post('/change-password', authMiddleware, changePassword);
router.post('/update-profile', authMiddleware, updateProfile);

export default router;