import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import http from 'http';

import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

import { globalErrorHandler } from './middleware/ErrorMiddleware.js';

dotenv.config({ path: '.env.dev' });

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(morgan('combined'));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/comments', commentRoutes);

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinBlog', (blogId) => {
        socket.join(blogId);
        console.log(`User joined blog: ${blogId}`);
    });

    socket.on('newComment', (commentData) => {
        io.to(commentData.blogId).emit('updateComments', commentData);
    });

    socket.on('disconnect', () => console.log('User disconnected:', socket.id));
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.use(globalErrorHandler);

export { app, server, io };
