import express from 'express';
import cors from 'cors';
import connectDB from './database/db.js';
import todoRoutes from './routes/todo.route.js';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import clientsRoutes from './routes/clients.route.js';
import imageRoutes from './routes/image.route.js';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/api/todo', todoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notification', clientsRoutes);
app.use('/api/image', imageRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    connectDB();
})