import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

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

export const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body.name ? req.body : req.query;
    
    try {
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email already in use' });

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
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = { ...req.body, ...req.query, ...req.params };

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            token: generateToken(user._id),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const getMe = async (req, res) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    res.json(req.user);
};

export const updateProfile = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, email } = req.body;

        if (name !== undefined) user.name = name;
        if (email !== undefined) {
            const existingUser = await User.findOne({ email });
            if (existingUser && existingUser._id.toString() !== user._id.toString()) {
                return res.status(400).json({ message: 'Email already in use' });
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
    } catch (err) {
        console.error('Update Profile Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};