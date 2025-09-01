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

// dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const __dirname = path.resolve();

const app = express();
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://todo.local', 'http://api.todo.local'],
    credentials: true,
}));
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

app.get("/burn", (req, res) => {
  const start = Date.now();
  const duration = parseInt(req.query.ms) || 1000; // default 1s burn (reduced from 5s)

  // Non-blocking CPU burn using setImmediate
  const burnCPU = () => {
    const chunkStart = Date.now();
    // Burn CPU for 10ms chunks, then yield control
    while (Date.now() - chunkStart < 10) {
      Math.sqrt(Math.random() * Math.random());
    }
    
    if (Date.now() - start < duration) {
      setImmediate(burnCPU); // Continue burning in next tick
    } else {
      res.send(`Burned CPU for ${Date.now() - start}ms`);
    }
  };

  burnCPU();
});

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