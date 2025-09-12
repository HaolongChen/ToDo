import express from 'express';
import { burnMemory, burnRPS } from '../controllers/burn.controller.js';

const router = express.Router();

router.get('/memory', burnMemory)
router.get('/rps', burnRPS)

export default router;