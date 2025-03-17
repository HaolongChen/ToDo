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
        const { description, completed, assigned, important, due, message } = req.body;
        if(!userId) return res.status(400).json({ message: 'User ID is required' });
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({ message: 'User not found' });
        if(user.team.length === 0) return res.status(400).json({ message: 'User does not have a team' });
        const partners = req.body.partners;
        let flag = true;
        const userGroup = await Group.findOne({ user: userId, name: 'Assigned by me' });
        if(!userGroup) return res.status(404).json({ message: 'Group not found' });
        for(let partner of partners) {
            if(!partner) return res.status(400).json({ message: 'Partner ID is required' });
            if(!user.team.includes(partner)) {
                flag = false;
                continue;
            }
            const partnerUser = await User.findOne({ name: partner }).select('-password');
            if(!partnerUser) return res.status(404).json({ message: 'Partner user not found' });
            const todo = new Todo({ description, completed, assigned, important, due, message, user: partnerUser._id });
            await todo.save();

            const group = await Group.findOne({ user: partnerUser._id, name: 'Assigned to me' });
            group.todo.push(todo._id);
            await group.save();

            userGroup.todo.push(todo._id);

            const waitlist = new Waitlist({ toUser: partnerUser._id, fromUser: userId, todo: todo._id, isRequest: false, isProcessed: false, isOfficial: false });
            await waitlist.save();
        }
        await userGroup.save();
        if(!flag) return res.status(400).json({ message: 'Invalid partner ID' });
        res.status(200).json({ message: 'Assignment sent successfully' });
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
        user.pendingTeam.push(toUserId);
        await user.save();
        res.status(200).json({ message: 'Request sent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
        
    }
}

export const removeFromTeam = async (req, res) => {
    try {
        const userId = req.user._id;
        const toUserId = req.body.toUser;
        if(!userId) return res.status(400).json({ message: 'User ID is required' });
        const user = await User.findById(userId).select('-password');
        if(!user) return res.status(404).json({ message: 'User not found' });
        if(!user.team.includes(toUserId)) return res.status(400).json({ message: 'User is not in the team' });
        

        user.team = user.team.filter(member => member != toUserId);
        await user.save();
        console.log({ user: user._id, toUser: toUserId });

        const toUser = await User.findById(toUserId).select('-password');
        if (!toUser) return res.status(404).json({ message: 'User not found' });
        toUser.team = toUser.team.filter(member => member != userId);
        await toUser.save();

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
        user.team.push(fromUser._id);
        await user.save();
        fromUser.team.push(user._id);
        await fromUser.save();
        waitlist.isProcessed = true;
        await waitlist.save();
        const newWaitlist = new Waitlist({ toUser: fromUser._id, fromUser: userId, isRequest: false, isProcessed: false, isOfficial: true, message: "I have accepted your request" });
        await newWaitlist.save();
        fromUser.pendingTeam = fromUser.pendingTeam.filter((id) => id != userId);
        await fromUser.save();
        res.status(200).json({ message: 'Request accepted successfully' });
    } catch (error) {
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
        await waitlist.delete();
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
        waitlist.isProcessed = true;
        await waitlist.save();
        const newWaitlist = new Waitlist({ toUser: waitlist.fromUser, fromUser: userId, isRequest: false, isProcessed: false, isOfficial: true, message: "I have rejected your request" });
        await newWaitlist.save();
        const fromUser = await User.findById(waitlist.fromUser).select('-password');
        if(!fromUser) return res.status(404).json({ message: 'User not found' });
        fromUser.pendingTeam = fromUser.pendingTeam.filter((id) => id != userId);
        await fromUser.save();
        res.status(200).json({ message: 'Request rejected successfully' });
    } catch (error) {
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
        let waitlist = await Waitlist.find({ toUser: userId, isRequest: true }).sort({ createdAt: -1 });
        for (let list of waitlist) {
            list.isProcessed = true;
            await list.save();
        }
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