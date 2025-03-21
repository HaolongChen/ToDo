import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { getNotifications, sendAssignment, sendRequest, acceptRequest, deleteWaitlist, rejectRequest, getRequests, getAllteammates, getUserInfo } from '../controllers/clients.controller.js';

const router = express.Router();

router.get('/get-notifications', authMiddleware, getNotifications);
router.post('/send', authMiddleware, sendAssignment);
router.post('/request', authMiddleware, sendRequest);
router.post('/accept/:id', authMiddleware, acceptRequest);
router.post('/delete/:id', authMiddleware, deleteWaitlist);
router.post('/reject/:id', authMiddleware, rejectRequest);
router.get('/get-requests', authMiddleware, getRequests);
router.get('/get-teammates', authMiddleware, getAllteammates);
router.get('/get-user-info/:id', authMiddleware, getUserInfo);

export default router