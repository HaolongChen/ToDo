import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/generateToken.js';
import User from '../models/user.model.js';
import Group from '../models/group.model.js';

export const signup = async (req, res) => {
    try {
        let { username, password, coverImage } = req.body;
        const existingUser = await User.findOne({username});
        if(existingUser){
            return res.status(400).json({message: 'User already exists'});
        }
        if(password.length < 6){
            return res.status(400).json({message: 'Password must be at least 6 characters long'});
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({username: username, password: hashedPassword, coverImg: coverImage, totalTasks: 0, completedTasks: 0, totalTeams: 0, pendingTeam: []});
        await user.save();
        generateToken(user._id, res);
        const myDay = new Group({name: 'My Day', user: user._id});
        await myDay.save();
        const important = new Group({name: 'Important', user: user._id});
        await important.save();
        const planned = new Group({name: 'Planned', user: user._id});
        await planned.save();
        const assignedToMe = new Group({name: 'Assigned to me', user: user._id});
        await assignedToMe.save();
        const assignedByMe = new Group({name: 'Assigned by me', user: user._id});
        await assignedByMe.save();
        const { password: ignored, ...userData } = user.toObject(); // Remove password from user object
        res.status(201).json(userData);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Server error'});
    }
}

export const signin = async (req, res) => {
    try {
        console.log(req.body);
        const username = req.body.username;
        const password = req.body.password;
        // console.log(username);
        // console.log(password);
        if(!username){
            return res.status(400).json({message: 'Username cannot be empty'});
        }
        if(!password){
            return res.status(400).json({message: 'Password cannot be empty'});
        }
        if(password.length < 6){
            return res.status(400).json({message: 'Password must be at least 6 characters long'});
        }
        const user = await User.findOne({username});
        if(!user){
            return res.status(400).json({message: 'Username or password is incorrect'});
        }
        const isMatch = await bcrypt.compare(password, user?.password || '');
        if(!isMatch){
            return res.status(400).json({message: 'Username or password is incorrect'});
        }
        generateToken(user._id, res);
        const { password: ignored, ...userData } = user.toObject(); // Remove password from user object
        res.status(200).json(userData);
    } catch (error) {
        console.log(error);
        
    }
}

export const logout = (req, res) => {
    try {
        // console.log(req.cookies.jwt);
        res.cookie('jwt', '', {
            maxAge: 0,
            httpOnly: true,
            secure: process.env.MODE !== 'development',
            sameSite: 'lax',
            domain: '.todo.local',
        });
        res.status(200).json({message: 'Logged out successfully'});
    } catch (error) {
        console.log(error);
        
    }
}

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        // console.log(user);
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        
    }
}

export const changePassword = async (req, res) => {
    try {
        const password = req.body.oldPassword;
        const newPassword = req.body.newPassword;
        if(password.length < 6){
            return res.status(400).json({message: 'Password must be at least 6 characters long'});
        }
        const isMatch = await bcrypt.compare(password, req.user.password);
        if(!isMatch){
            return res.status(400).json({message: 'Original password is incorrect'});
        }
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await User.findByIdAndUpdate(req.user._id, {password: hashedPassword});
        generateToken(req.user._id, res);
        res.status(200).json({message: 'Password changed successfully'});
    } catch (error) {
        console.log(error);
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { email, bio } = req.body;
        const userId = req.user._id;
        
        const user = await User.findByIdAndUpdate(
            userId,
            { email, bio },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
}