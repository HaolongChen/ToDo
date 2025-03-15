import express from 'express';
import { createTodo, getTodos, updateTodo, deleteTodo, getAllTodos, getAllGroups, createGroup, updateGroup, deleteGroup, plusCompletedTasks, minusCompletedTasks } from '../controllers/todo.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
const router = express.Router();

router.post('/create', authMiddleware, createTodo);
router.get('/get/:id', authMiddleware, getTodos);
router.get('/getall', authMiddleware, getAllTodos);
router.post('/update/:id', authMiddleware, updateTodo);
router.post('/delete/:id', authMiddleware, deleteTodo);
router.get('/get-groups', authMiddleware, getAllGroups);
router.post('/create-group', authMiddleware, createGroup);
router.post('/update-group/:id', authMiddleware, updateGroup);
router.post('/delete-group/:id', authMiddleware, deleteGroup);
router.post('/plus-completed', authMiddleware, plusCompletedTasks);
router.post('/minus-completed', authMiddleware, minusCompletedTasks);

export default router; 