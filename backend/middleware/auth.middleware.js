import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const authMiddleware = async (req, res, next) => {
    try {
        if(!req.cookies){
            console.log("No cookie");
            return res.status(401).json({message: 'Unauthorized'});
        }
        const token = req.cookies.jwt;
        if(!token){
            console.log("No token");
            return res.status(401).json({message: 'Unauthorized'});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded){
            console.log("verify failed");
            return res.status(401).json({message: 'Unauthorized'});
        }
        const user = await User.findById(decoded.userId);
        if(!user){
            return res.status(401).json({message: 'User not found'});
        }
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        // Important: Send response when an error occurs
        return res.status(401).json({message: 'Authentication error'});
    }
}