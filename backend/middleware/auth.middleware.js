import cookies from 'cookie-parser';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if(!token){
            return res.status(401).json({message: 'Unauthorized'});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({message: 'Unauthorized'});
        }
        const user = User.findById(decoded.userId).select('-password');
        if(!user){
            return res.status(401).json({message: 'User not found'});
        }
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        
    }
}