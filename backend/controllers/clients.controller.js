import Waitlist from "../models/waitlist.model.js";
import User from "../models/user.model.js";
import Group from "../models/group.model.js";
import Todo from "../models/todo.model.js";

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

export const sendAssignment = async (req, res) => {
    try {
        const userId = req.user._id;
        const { description, completed, assigned, important, due, message } = req.body;
        if(!userId) return res.status(400).json({ message: 'User ID is required' });
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({ message: 'User not found' });
        if(user.team.length === 0) return res.status(400).json({ message: 'User does not have a team' });
        const partners = req.body.partners;
        let flag = true;
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

            const waitlist = new Waitlist({ toUser: partnerUser._id, fromUser: userId, todo: todo._id, isRequest: false, isProcessed: false, isOfficial: false });
            await waitlist.save();
        }
        if(!flag) return res.status(400).json({ message: 'Invalid partner ID' });
        res.status(200).json({ message: 'Assignment sent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
        
    }
}

export const sendRequest = async (req, res) => {
    try {
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
        res.status(200).json({ message: 'Request sent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
        
    }
}

export const acceptRequest = async (req, res) => {
    try {
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
        res.status(200).json({ message: 'Request accepted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
        
    }
}

export const deleteWaitlist = async (req, res) => {
    try {
        const id = req.params.id;
        const waitlist = await Waitlist.findByIdAndDelete(id);
        if(!waitlist) return res.status(404).json({ message: 'Request not found' });
        res.status(200).json({ message: 'Request deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
        
    }
}

export const rejectRequest = async (req, res) => {
    try {
        const userId = req.user._id;
        const id = req.params.id;
        const waitlist = await Waitlist.findById(id);
        if(!waitlist) return res.status(404).json({ message: 'Request not found' });
        waitlist.isProcessed = true;
        await waitlist.save();
        const newWaitlist = new Waitlist({ toUser: waitlist.fromUser, fromUser: userId, isRequest: false, isProcessed: false, isOfficial: true, message: "I have rejected your request" });
        await newWaitlist.save();
        res.status(200).json({ message: 'Request rejected successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
        
    }
}

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