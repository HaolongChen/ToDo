import express from 'express';
import { createTodo, getTodos, updateTodo, deleteTodo, getAllTodos, getAllGroups } from '../controllers/todo.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
const router = express.Router();

router.post('/create', authMiddleware, createTodo);
router.get('/get/:id', authMiddleware, getTodos);
router.get('/getall', authMiddleware, getAllTodos);
router.post('/update/:id', authMiddleware, updateTodo);
router.post('/delete/:id', authMiddleware, deleteTodo);
router.get('/get-groups', authMiddleware, getAllGroups);

export default router; 