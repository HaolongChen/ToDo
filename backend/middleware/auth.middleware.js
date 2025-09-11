import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const authMiddleware = async (req, res, next) => {
    try {
        console.log('Auth middleware - Headers:', req.headers);
        console.log('Auth middleware - Cookies:', req.cookies);
        
        if(!req.cookies){
            console.log("No cookies found in request");
            return res.status(401).json({message: 'Unauthorized - No cookies'});
        }
        const token = req.cookies.jwt;
        if(!token){
            console.log("No JWT token found in cookies");
            console.log("Available cookies:", Object.keys(req.cookies));
            return res.status(401).json({message: 'Unauthorized - No token'});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded){
            console.log("JWT verification failed");
            return res.status(401).json({message: 'Unauthorized - Invalid token'});
        }
        const user = await User.findById(decoded.userId);
        if(!user){
            console.log("User not found for ID:", decoded.userId);
            return res.status(401).json({message: 'User not found'});
        }
        req.user = user;
        next();
    } catch (error) {
        console.log('Auth middleware error:', error);
        // Important: Send response when an error occurs
        return res.status(401).json({message: 'Authentication error'});
    }
}