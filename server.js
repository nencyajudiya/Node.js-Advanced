import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import http from 'http';
import { Server } from 'socket.io';
import commentRoutes from './routes/commentRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

connectDB();

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

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export { io };