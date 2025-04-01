import Waitlist from "../models/waitlist.model.js";
import User from "../models/user.model.js";
import Group from "../models/group.model.js";
import Todo from "../models/todo.model.js";

/**
 * @description Get all notifications of the user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Array<Waitlist>} - List of notifications
 * @throws {Error} - If there is an error in getting notifications
 */
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        let waitlist = await Waitlist.find({ toUser: userId, isRequest: false });
        waitlist.sort((a, b) => {
            if (a.isProcessed && !b.isProcessed) {
                return -1;
            }
            if (!a.isProcessed && b.isProcessed) {
                return 1;
            }
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA;
        });
        for (let list of waitlist) {
            list.isProcessed = true;
            await list.save();
        }

        res.status(200).json(waitlist);

    } catch (error) {
        console.status(500).json({ message: error.message });
    }
}


/**
 * @description Send an assignment to other users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Message indicating whether the assignment was sent successfully
 * @throws {Error} - If there is an error in sending the assignment
 */
export const sendAssignment = async (req, res) => {
    try {
        // TODO: send emails to the users
        const userId = req.user._id;
        // console.log(userId)
        const { description, important, due, message, partners } = req.body;
        if(!userId) return res.status(400).json({ message: 'User ID is required' });
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({ message: 'User not found' });
        if(user.team.length === 0) return res.status(400).json({ message: 'User does not have a team' });
        let flag = true;
        const userGroup = await Group.findOne({ user: userId, name: 'Assigned by me' });
        if(!userGroup) return res.status(404).json({ message: 'Group not found' });
        
        // Store created todos to include in response
        const createdTodos = [];
        const uniqueMarker = `${userId}-${Date.now()}`; // Unique marker for the todo
        
        for(let partner of partners) {
            if(!partner) return res.status(400).json({ message: 'Partner ID is required' });
            if(!user.team.includes(partner)) {
                flag = false;
                continue;
            }
            const partnerUser = await User.findById(partner).select('-password');
            if(!partnerUser) return res.status(404).json({ message: 'Partner user not found' });
            const todo = new Todo({ 
                description, 
                completed: false, // explicitly set to false 
                assigned: true, 
                important, 
                due, 
                message, 
                user: partnerUser._id ,
                uniqueMarker: uniqueMarker
            });
            await todo.save();

            partnerUser.totalTasks += 1;
            await partnerUser.save();

            const group = await Group.findOne({ user: partnerUser._id, name: 'Assigned to me' });
            group.todo.push(todo._id);
            await group.save();

            userGroup.todo.push(todo._id);
            createdTodos.push(todo);

            const waitlist = new Waitlist({ toUser: partnerUser._id, fromUser: userId, todo: todo._id, isRequest: false, isProcessed: false, isOfficial: false });
            await waitlist.save();
        }
        await userGroup.save();
        if(!flag) return res.status(400).json({ message: 'Invalid partner ID' });
        res.status(200).json({ 
            message: 'Assignment sent successfully',
            todos: createdTodos // Return the created todos for frontend use
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const editAssignment = async (req, res) => {
    try {
        const { description, todos } = req.body;
        
        for(let todoId of todos.originalIds){
            if(!todoId) return res.status(400).json({ message: 'Todo ID is required' });
            const todo = await Todo.findById(todoId);
            if(!todo) return res.status(404).json({ message: 'Todo not found' });
            todo.description = description;
            await todo.save();

        }

        for(let toUserId of todos.assignedTo){
            const waitlist = new Waitlist({ toUser: toUserId, fromUser: userId, isRequest: false, isProcessed: false, isOfficial: false, message: "I have edited an assignment" });
            await waitlist.save();
        }


        res.status(200).json({ message: 'Assignments updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteAssignmentForSingleTeammate = async (req, res) => {
    try {
        const userId = req.user._id;
        const { todos, index } = req.body;
        if(!userId) return res.status(400).json({ message: 'User ID is required' });
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({ message: 'User not found' });

        const partnerId = todos.assignedTo[index];
        if(!partnerId) return res.status(400).json({ message: 'Partner ID is required' });
        if(!user.team.includes(partnerId)) return res.status(400).json({ message: 'User is not in the team' });
        const partnerUser = await User.findById(partnerId).select('-password');
        if(!partnerUser) return res.status(404).json({ message: 'Partner user not found' });
        const partnerGroup = await Group.findOne({ user: partnerUser._id, name: 'Assigned to me' });
        if(!partnerGroup) return res.status(404).json({ message: 'Group not found' });
        
        if(user.team.length === 0) return res.status(400).json({ message: 'User does not have a team' });
        const userGroup = await Group.findOne({ user: userId, name: 'Assigned by me' });
        if(!userGroup) return res.status(404).json({ message: 'Group not found' });
        
        const todoId = todos.originalIds[index];
        if(!todoId) return res.status(400).json({ message: 'Todo ID is required' });
        const todo = await Todo.findById(todoId);
        if(!todo) return res.status(404).json({ message: 'Todo not found' });

        const waitlist = new Waitlist({ toUser: partnerId, fromUser: userId, isRequest: false, isProcessed: false, isOfficial: false, message: "I have deleted an assignment" });
        await waitlist.save();
        
        await Todo.deleteOne({ _id: todoId });

        partnerGroup.todo = partnerGroup.todo.filter(id => id.toString() !== todoId.toString());
        await partnerGroup.save();

        userGroup.todo = userGroup.todo.filter(id => id.toString() !== todoId.toString());
        await userGroup.save();
        
        res.status(200).json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
        
    }
}

export const deleteAssignmentForAllTeammates = async (req, res) => {
    try {
        const userId = req.user._id;
        const { todos } = req.body;
        if(!userId) return res.status(400).json({ message: 'User ID is required' });
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({ message: 'User not found' });
        
        const len = todos.assignedTo.length;
        const userGroup = await Group.findOne({ user: userId, name: 'Assigned by me' });
        if(!userGroup) return res.status(404).json({ message: 'Group not found' });

        for(let i = 0; i < len; i++){
            const partnerId = todos.assignedTo[i];
            if(!partnerId) return res.status(400).json({ message: 'Partner ID is required' });
            const partnerUser = await User.findById(partnerId).select('-password');
            if(!partnerUser) return res.status(404).json({ message: 'Partner user not found' });
            const partnerGroup = await Group.findOne({ user: partnerUser._id, name: 'Assigned to me' });
            if(!partnerGroup) return res.status(404).json({ message: 'Group not found' });
            
            const todoId = todos.originalIds[i];
            if(!todoId) return res.status(400).json({ message: 'Todo ID is required' });
            const todo = await Todo.findById(todoId);
            if(!todo) return res.status(404).json({ message: 'Todo not found' });

            const waitlist = new Waitlist({ toUser: partnerId, fromUser: req.user._id, isRequest: false, isProcessed: false, isOfficial: false, message: "I have deleted an assignment" });
            await waitlist.save();
            
            await Todo.deleteOne({ _id: todoId });
            partnerGroup.todo = partnerGroup.todo.filter(id => id.toString() !== todoId.toString());
            await partnerGroup.save();
            userGroup.todo = userGroup.todo.filter(id => id.toString() !== todos.originalIds[i].toString());
        }

        await userGroup.save();

        res.status(200).json({ message: 'Assignments deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
        
    }
}

export const getAssignmentsStatus = async (req, res) => {
    try {
        const { todos } = req.body;
        let assignmentsStatus = [];
        for(let todo of todos){
            const len = todo.originalIds.length;
            for(let i = 0; i < len; i++){
                const todoId = todo.originalIds[i].toString();
                const curTodo = await Todo.findById(todoId).select('completed');
                if(!curTodo) return res.status(404).json({ message: 'Todo not found' });
                assignmentsStatus[todoId] = curTodo.completed;
            }
        }
        res.status(200).json(assignmentsStatus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

/**
 * @description Send a request to join a team
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Message indicating whether the request was sent successfully
 * @throws {Error} - If there is an error in sending the request
 */
export const sendRequest = async (req, res) => {
    try {
        // TODO: send emails to the users
        const userId = req.user._id;
        const toUserId = req.body.toUser;
        if(!userId) return res.status(400).json({ message: 'User ID is required' });
        const user = await User.findById(userId).select('-password');
        if(!user) return res.status(404).json({ message: 'User not found' });
        const toUser = await User.findById(toUserId).select('-password');
        if(!toUser) return res.status(404).json({ message: 'User not found' });
        if(userId == toUserId) return res.status(400).json({ message: 'Cannot send request to yourself' });
        if(user.team.length != 0){
            if(user.team.includes(toUserId)) {
                return res.status(400).json({ message: 'User has already been in your team' });
            }
        }
        const isExist = await Waitlist.findOne({ toUser: toUserId, fromUser: userId, isRequest: true, isProcessed: false });
        if(isExist) return res.status(400).json({ message: 'Request already sent' });
        const isExist2 = await Waitlist.findOne({ toUser: userId, fromUser: toUserId, isRequest: true, isProcessed: false });
        if(isExist2) return res.status(400).json({ message: 'Request already sent' });
        const waitlist = new Waitlist({ toUser: toUserId, fromUser: userId, isRequest: true, isProcessed: false });
        await waitlist.save();
        user.pendingTeam.push({userId: toUserId, from: true});
        toUser.pendingTeam.push({userId: userId, from: false});
        await toUser.save();
        await user.save();
        res.status(200).json({ message: 'Request sent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
}

export const removeFromTeam = async (req, res) => {
    try {
        const userId = req.user._id;
        const toUserId = req.body.toUser;
        if(!userId) return res.status(400).json({ message: 'User ID is required' });
        const user = await User.findById(userId).select('-password');
        if(!user) return res.status(404).json({ message: 'User not found' });
        // if(!user.team.includes(toUserId)) return res.status(400).json({ message: 'User is not in the team' });
        
        // Convert IDs to strings for proper comparison
        user.team = user.team.filter(member => member.toString() !== toUserId.toString());
        await user.save();
        console.log({ user: userId, toUser: toUserId });

        const toUser = await User.findById(toUserId).select('-password');
        if (!toUser) return res.status(404).json({ message: 'User not found' });
        toUser.team = toUser.team.filter(member => member.toString() !== userId.toString());
        await toUser.save();

        const waitlist = new Waitlist({ toUser: toUserId, fromUser: userId, isRequest: false, isProcessed: false, isOfficial: true, message: "I have removed you from my team" });
        await waitlist.save();

        res.status(200).json({ message: 'User removed from team successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
        
    }
}

/**
 * @description Accept a request to join a team
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Message indicating whether the request was accepted successfully
 * @throws {Error} - If there is an error in accepting the request
 */
export const acceptRequest = async (req, res) => {
    try {
        // TODO: send emails to the users
        const userId = req.user._id;
        const id = req.params.id;
        const waitlist = await Waitlist.findById(id);
        if(!waitlist) return res.status(404).json({ message: 'Request not found' });
        const user = await User.findById(userId).select('-password');
        if(!user) return res.status(404).json({ message: 'User not found' });
        const fromUser = await User.findById(waitlist.fromUser).select('-password');
        if(!fromUser) return res.status(404).json({ message: 'User not found' });
        
        // Add each other to teams
        user.team.push(fromUser._id);
        await user.save();
        fromUser.team.push(user._id);
        await fromUser.save();
        
        // Mark waitlist as processed
        waitlist.isProcessed = true;
        await waitlist.save();
        
        // Create notification for the other user
        const newWaitlist = new Waitlist({ 
            toUser: fromUser._id, 
            fromUser: userId, 
            isRequest: false, 
            isProcessed: false, 
            isOfficial: true, 
            message: "I have accepted your request" 
        });
        await newWaitlist.save();
        
        // Remove from pendingTeam using proper string comparison of ObjectIds
        fromUser.pendingTeam = fromUser.pendingTeam.filter(item => item.userId.toString() !== userId.toString());
        user.pendingTeam = user.pendingTeam.filter(item => item.userId.toString() !== fromUser._id.toString());
        
        await user.save();
        await fromUser.save();
        
        res.status(200).json({ 
            message: 'Request accepted successfully',
            user: {
                _id: fromUser._id,
                username: fromUser.username
            }
        });
    } catch (error) {
        console.error("Error in acceptRequest:", error);
        res.status(500).json({ message: error.message });
    }
}

/**
 * @description Delete a request to join a team
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Message indicating whether the request was deleted successfully
 * @throws {Error} - If there is an error in deleting the request
 */
export const deleteWaitlist = async (req, res) => {
    try {
        const id = req.params.id;
        const waitlist = await Waitlist.findById(id);
        if(!waitlist) return res.status(404).json({ message: 'Request not found' });
        if(waitlist.isRequest){
            await rejectRequest(req, res);
        }
        await Waitlist.findByIdAndDelete(id);
        res.status(200).json({ message: 'Request deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
        
    }
}

/**
 * @description Reject a request to join a team
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Message indicating whether the request was rejected successfully
 * @throws {Error} - If there is an error in rejecting the request
 */

export const rejectRequest = async (req, res) => {
    try {
        // TODO: send emails to the users
        const userId = req.user._id;
        const id = req.params.id;
        const waitlist = await Waitlist.findById(id);
        if(!waitlist) return res.status(404).json({ message: 'Request not found' });
        
        // Mark waitlist as processed
        waitlist.isProcessed = true;
        await waitlist.save();
        
        // Create notification for the other user
        const newWaitlist = new Waitlist({ 
            toUser: waitlist.fromUser, 
            fromUser: userId, 
            isRequest: false, 
            isProcessed: false, 
            isOfficial: true, 
            message: "I have rejected your request" 
        });
        await newWaitlist.save();
        
        // Get both users
        const fromUser = await User.findById(waitlist.fromUser).select('-password');
        if(!fromUser) return res.status(404).json({ message: 'User not found' });
        const user = await User.findById(userId).select('-password');
        if(!user) return res.status(404).json({ message: 'User not found' });
        
        // Remove from pendingTeam using proper string comparison of ObjectIds
        fromUser.pendingTeam = fromUser.pendingTeam.filter(item => item.userId.toString() !== userId.toString());
        user.pendingTeam = user.pendingTeam.filter(item => item.userId.toString() !== fromUser._id.toString());
        
        // Save changes to both users
        await user.save();
        await fromUser.save();
        
        res.status(200).json({ message: 'Request rejected successfully' });
    } catch (error) {
        console.error("Error in rejectRequest:", error);
        res.status(500).json({ message: error.message });
    }
}

/**
 * @description Get all requests to join a team
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Array<Waitlist>} - List of requests
 * @throws {Error} - If there is an error in getting requests
 */
export const getRequests = async (req, res) => {
    try {
        const userId = req.user._id;
        let waitlist = await Waitlist.find({ toUser: userId, isRequest: true, isProcessed: false }).sort({ createdAt: -1 });
        
        console.log(waitlist);
        res.status(200).json(waitlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
        
    }
}

/**
 * @description Get all teammates of a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Array<User>} - List of teammates
 * @throws {Error} - If there is an error in getting teammates
 */
export const getAllteammates = async (req, res) => {
    try {
        const userId = req.user._id;
        const team = await User.findById(userId).select('team');
        if(!team) return res.status(404).json({ message: 'Team not found' });
        return res.status(200).json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
        
    }
}

/**
 * @description Retrieve information about a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Information about the user including if the user is the requester or a teammate
 * @throws {Error} - If there is an error in retrieving the user information
 */

export const getUserInfo = async (req, res) => {
    try {
        const myId = req.user._id;
        const userId = req.params.id;
        const user = await User.findById(userId)
            .select('-password')
            .populate('team', 'username _id coverImg'); // Populate team with necessary fields
            
        if(!user) return res.status(404).json({ message: 'User not found' });
        if(myId == userId) return res.status(200).json({ personal: true, teammate: false, user });
        const isteammate = await User.findById(myId).select('team');
        if(!isteammate) return res.status(200).json({ personal: false, teammate: false, user });
        if(isteammate.team.includes(userId)) return res.status(200).json({ personal: false, teammate: true, user });
        return res.status(200).json({ personal: false, teammate: false, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}