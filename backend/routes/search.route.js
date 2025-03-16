import express from 'express';
import { search, getUserProfile } from '../controllers/search.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
const router = express.Router();

router.get('/', authMiddleware, search);
router.get('/user/:userId', authMiddleware, getUserProfile);

export default router;