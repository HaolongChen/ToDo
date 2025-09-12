import express from 'express';
import cors from 'cors';
import connectDB from './database/db.js';
import todoRoutes from './routes/todo.route.js';
// import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import clientsRoutes from './routes/clients.route.js';
import imageRoutes from './routes/image.route.js';
import searchRoutes from './routes/search.route.js';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import { cookieCleanupMiddleware, cookieCorsMiddleware } from './middleware/cookie.middleware.js';
import burnRoutes from './routes/burn.route.js';

// dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const __dirname = path.resolve();

const app = express();
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:5173', 
            'http://127.0.0.1:5173', 
            'http://todo.local', 
            'http://api.todo.local', 
            'https://chl-frontend.momen.cloud', 
            'https://chl-backend.functorz.work',
            'https://pub-10fdc43a7c1940d4b8a28e830fd7388d.r2.dev'
        ];
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
}));

// Add cookie handling middleware
app.use(cookieCorsMiddleware);
app.use(cookieCleanupMiddleware);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/healthz', (req, res) => {
    setTimeout(() => {
        res.status(200).json({ message: 'Server is healthy.' });
    }, 3000)
})

app.get('/healthz/fast', (req, res) => {
    res.status(200).json({ message: 'Server is healthy.' });
});

app.use("/burn", burnRoutes);

const port = process.env.PORT || 5000;

app.use('/api/todo', todoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notification', clientsRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/search', searchRoutes);

// Serve static files and handle all routes for frontend
// app.use(express.static(path.join(__dirname, '/frontend/dist')));
// app.get('*', (req, res) => {
//     // API routes will be handled by their respective middleware
//     if (!req.path.startsWith('/api')) {
//         res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
//     }
// });

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    connectDB();
})