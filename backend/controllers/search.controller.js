import User from '../models/user.model.js';
import Todo from '../models/todo.model.js';
import Group from '../models/group.model.js';

// Search for users, todos, and groups
export const search = async (req, res) => {
    try {
        const { query } = req.query;
        const userId = req.user._id;
        
        if (!query || query.trim() === '') {
            return res.status(200).json({ 
                users: [], 
                todos: [], 
                groups: [] 
            });
        }

        // Search for users with username containing the query
        const users = await User.find({
            username: { $regex: query, $options: 'i' },
            _id: { $ne: userId } // Exclude current user
        }).select('username _id coverImg');

        // Search for todos belonging to the current user containing the query in description
        const todos = await Todo.find({
            user: userId,
            description: { $regex: query, $options: 'i' }
        }).select('description _id');

        // Search for groups belonging to the current user containing the query in name
        const groups = await Group.find({
            user: userId,
            name: { $regex: query, $options: 'i' }
        }).select('name _id');

        res.status(200).json({
            users,
            todos,
            groups
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

// Get user profile (for viewing other users)
export const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findById(userId)
            .select('username coverImg email bio totalTasks completedTasks totalTeams')
            .populate('team', 'username _id coverImg');
            
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // console.log(user);
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}