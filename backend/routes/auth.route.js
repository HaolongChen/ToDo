import express from 'express';
import { signup, signin, logout, getUser } from '../controllers/auth.controller.js';
const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/logout', logout);
router.get('/user', getUser);

export default router;