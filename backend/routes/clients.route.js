import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { getNotifications, sendAssignment, sendRequest, acceptRequest, deleteWaitlist, rejectRequest, getRequests, getAllteammates, getUserInfo, removeFromTeam, editAssignment, deleteAssignmentForSingleTeammate, deleteAssignmentForAllTeammates, getAssignmentsStatus } from '../controllers/clients.controller.js';

const router = express.Router();

router.get('/get-notifications', authMiddleware, getNotifications);
router.post('/send-assignment', authMiddleware, sendAssignment);
router.post('/send-requests', authMiddleware, sendRequest);
router.post('/accept/:id', authMiddleware, acceptRequest);
router.post('/delete/:id', authMiddleware, deleteWaitlist);
router.post('/reject/:id', authMiddleware, rejectRequest);
router.get('/get-requests', authMiddleware, getRequests);
router.get('/get-teammates', authMiddleware, getAllteammates);
router.get('/get-user-info/:id', authMiddleware, getUserInfo);
router.post('/remove-from-team', authMiddleware, removeFromTeam);
router.post('/edit-assignment', authMiddleware, editAssignment);
router.post('/delete-assignment-for-single-teammate', authMiddleware, deleteAssignmentForSingleTeammate);
router.post('/delete-assignment-for-all-teammates', authMiddleware, deleteAssignmentForAllTeammates);
router.get('/get-assignments-status', authMiddleware, getAssignmentsStatus);

export default router;