import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/generateToken.js';
import User from '../models/user.model.js';
import Group from '../models/group.model.js';
import { v2 as cloudinary } from 'cloudinary';

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
        // if(!coverImage){
        //     coverImage = 'data:image/png;base64,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';
        // }
        // const status = await cloudinary.uploader.upload(coverImage)
        // coverImage = status.secure_url;
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({username: username, password: hashedPassword, coverImg: coverImage});
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
        res.status(201).json({user});
    } catch (error) {
        console.log(error);
        
    }
}

export const signin = async (req, res) => {
    try {
        console.log(req.body);
        const username = req.body.username;
        const password = req.body.password;
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
        res.status(200).json({
            username: user.username,
            teams: user.team,
            coverImage: user.coverImg
        });
    } catch (error) {
        console.log(error);
        
    }
}

export const logout = (req, res) => {
    try {
        console.log(req.cookies.jwt);
        res.cookie('jwt', '', {maxAge: 0});
        res.status(200).json({message: 'Logged out successfully'});
    } catch (error) {
        console.log(error);
        
    }
}

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.status(200).json({user});
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