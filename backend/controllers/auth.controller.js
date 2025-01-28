import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/generateToken.js';
import User from '../models/user.model.js';

export const signup = async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        const existingUser = await User.findOne({username});
        if(existingUser){
            return res.status(400).json({message: 'User already exists'});
        }
        if(password.length < 6){
            return res.status(400).json({message: 'Password must be at least 6 characters long'});
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({username, password: hashedPassword});
        await user.save();
        generateToken(user._id, res);
        // res.status(201).json({message: 'User created successfully'});
        res.status(201).json({user});
    } catch (error) {
        console.log(error);
        
    }
}

export const signin = async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        if(password.length < 6){
            return res.status(400).json({message: 'Password must be at least 6 characters long'});
        }
        const user = await User.findOne({username});
        if(!user){
            return res.status(400).json({message: 'Username or password is incorrect'});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message: 'Username or password is incorrect'});
        }
        generateToken(user._id, res);
        res.status(200).json({user});
    } catch (error) {
        console.log(error);
        
    }
}

export const logout = (req, res) => {
    res.clearCookie('jwt');
    res.status(200).json({message: 'Logged out successfully'});
}

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.status(200).json({user});
    } catch (error) {
        console.log(error);
        
    }
}