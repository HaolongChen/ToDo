import express from 'express';
import { uploadImage, getImage } from '../controllers/image.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
const router = express.Router();

router.post('/upload', authMiddleware, uploadImage);
router.get('/get/:id', getImage);

export default router