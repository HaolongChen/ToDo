import Todo from '../models/todo.model.js';
import Group from '../models/group.model.js';

export const createTodo = async (req, res) => {
    try {
        const { description, completed, assigned, important, due, message, groupId } = req.body;
        const todo = new Todo({ description, completed, assigned, important, due, message, user: req.user._id });
        await todo.save();
        const group = await Group.findById(groupId);
        if(!group) return res.status(404).json({ message: 'Group not found' });
        group.todo.push(todo._id);
        await group.save();
        res.status(201).json(todo);
    } catch (error) {
        console.log(error);
        console.log(req.body);
    }
}

export const getTodos = async (req, res) => {
    try {
        const groupId = req.params.id || req.body.groupId;
        const group = await Group.findById(groupId).populate('todo');
        if(!group) return res.status(404).json({ message: 'Group not found' });
        res.status(200).json( group.todo );
        // console.log(group.todo);
    } catch (error) {
        console.log(error);
    }
}

export const getAllTodos = async (req, res) => {
    try {
        const userId = req.user._id;
        const todos = await Todo.find({ user: userId });
        if(!todos) return res.status(404).json({ message: 'Todos not found' });
        res.status(200).json({ todos });
    } catch (error) {
        console.log(error);
        
    }
}

export const deleteTodo = async (req, res) => {
    try {
        const todoId = req.params.id || req.body.todoId;
        const status = await Todo.findByIdAndDelete(todoId);
        if(!status) return res.status(404).json({ message: 'Todo not found' });
        res.status(200).json({ message: 'Todo deleted successfully' });
    } catch (error) {
        console.log(error);
    }
}

export const updateTodo = async (req, res) => {
    try {
        const todoId = req.params.id || req.body.todoId;
        const todo = await Todo.findById(todoId);
        if(!todo) return res.status(404).json({ message: 'Todo not found' });
        if(req.body.description) todo.description = req.body.description;
        if(req.body.completed) todo.completed = req.body.completed;
        if(req.body.assigned) todo.assigned = req.body.assigned;
        if(req.body.important) todo.important = req.body.important;
        if(req.body.due) todo.due = req.body.due;
        if(req.body.message) todo.message = req.body.message;
        await todo.save();
        res.status(200).json({ message: 'Todo updated successfully' });
    } catch (error) {
        console.log(error);
    }
}

export const getAllGroups = async (req, res) => {
    try {
        const userId = req.user._id;
        const groups = await Group.find({ user: userId });
        if(!groups) return res.status(404).json({ message: 'Groups not found' });
        res.status(200).json({ groups });
    } catch (error) {
        console.log(error);
    }
}

export const createGroup = async (req, res) => {
    try {
        const { name } = req.body;
        const group = new Group({ name, user: req.user._id });
        await group.save();
        res.status(201).json({ message: 'Group created successfully' });
    } catch (error) {
        console.log(error);
    }
}