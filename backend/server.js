import express from 'express';
import cors from 'cors';
import connectDB from './database/db.js';
import todoRoutes from './routes/todo.route.js';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// app.use('/api/todo', todoRoutes);
app.use('/api/auth', authRoutes);

app.listen(port, () => {
    connectDB();
})