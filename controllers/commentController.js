import Comment from '../models/Comment.js';
import Blog from '../models/Blog.js';
import { validationResult } from 'express-validator';

export const addComment = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Validation failed',
                errors: errors.array(),
                received: req.body
            });
        }

        const data = { ...req.body, ...req.query, ...req.params };
        console.log("Combined data:", data);

        const blogId = data.blogId;
        const commentText = data.comment || data.text;

        if (!commentText) {
            return res.status(400).json({ 
                message: 'Comment text is required',
                received: data,
                expected: 'Use "comment" or "text" field'
            });
        }

        if (!blogId) {
            return res.status(400).json({ 
                message: 'Blog ID is required',
                received: data
            });
        }

        if (!req.user || !req.user._id) {
            return res.status(401).json({ 
                message: 'User authentication required'
            });
        }

        const blogExists = await Blog.findById(blogId);
        if (!blogExists) {
            return res.status(404).json({ 
                message: 'Blog not found',
                blogId: blogId
            });
        }

        const attachmentUrl = req.file 
            ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
            : '';

        const commentData = { 
            blog: blogId, 
            user: req.user._id, 
            text: commentText 
        };

        if (attachmentUrl) {
            commentData.attachment = attachmentUrl;
        }

        console.log("Creating comment with data:", commentData);

        const comment = new Comment(commentData);
        await comment.save();

        const populatedComment = await comment.populate('user', 'name email');

        req.app.get('io').to(blogId).emit('updateComments', populatedComment);

        res.status(201).json(populatedComment);
    } catch (error) {
        console.error('Comment creation error:', error);
        res.status(500).json({ 
            message: 'Server error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const getComments = async (req, res) => {
    const comments = await Comment.find({ blog: req.params.blogId })
        .populate('user', 'name email')
        .sort({ createdAt: -1 });
    res.json(comments);
};
