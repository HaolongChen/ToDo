import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '14d',
    });
    
    // Cookie configuration for cross-origin authentication
    let cookieOptions = {
        httpOnly: true,
        secure: true, // Always true for production HTTPS
        sameSite: 'none', // Required for cross-site cookies
        maxAge: 1000 * 60 * 60 * 24 * 14,
    };
    
    // For local development
    if (process.env.MODE === 'development') {
        cookieOptions.secure = false;
        cookieOptions.sameSite = 'lax';
        cookieOptions.domain = '.todo.local';
    }
    
    console.log('Setting cookie with options:', cookieOptions);
    res.cookie('jwt', token, cookieOptions);
}