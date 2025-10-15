import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { catchAsyncError } from '../middleware/catchAsyncError.js';
import { AppError } from '../middleware/ErrorMiddleware.js';

dotenv.config();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = "uploads/";
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

export const upload = multer({ storage });

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const register = catchAsyncError(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body.name ? req.body : req.query;
    
    const existing = await User.findOne({ email });
    if (existing) throw new AppError('Email already in use', 400);

    const avatar = req.file 
        ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
        : '';

    const user = new User({ name, email, password, avatar });
    await user.save();

    res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id),
    });
});

export const login = catchAsyncError(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = { ...req.body, ...req.query, ...req.params };

    const user = await User.findOne({ email });
    if (!user) throw new AppError("Invalid credentials", 400);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new AppError("Invalid credentials", 400);

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id),
    });
});

export const getMe = catchAsyncError(async (req, res) => {
    if (!req.user) throw new AppError('Not authorized', 401);
    res.json(req.user);
});

export const updateProfile = catchAsyncError(async (req, res) => {
    if (!req.user) throw new AppError('Not authorized', 401);

    const user = await User.findById(req.user._id);
    if (!user) throw new AppError('User not found', 404);

    const { name, email } = req.body;

    if (name !== undefined) user.name = name;
    if (email !== undefined) {
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser._id.toString() !== user._id.toString()) {
            throw new AppError('Email already in use', 400);
        }
        user.email = email;
    }

    if (req.file) {
        if (user.avatar && user.avatar.startsWith(`${req.protocol}://${req.get('host')}/uploads/`)) {
            const oldImagePath = user.avatar.replace(`${req.protocol}://${req.get('host')}/`, '');
            fs.unlink(oldImagePath, (err) => {
                if (err) console.error('Old avatar delete failed:', err.message);
            });
        }

        user.avatar = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    await user.save();

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
    });
});