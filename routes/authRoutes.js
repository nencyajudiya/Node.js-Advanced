import express from 'express';
import { register, login, getMe, updateProfile, upload } from '../controllers/AuthController.js';
import { body } from 'express-validator';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const mergeBodyAndQuery = (req, res, next) => {
  req.body = { ...req.params, ...req.query, ...req.body };
  next();
};

const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const updateProfileValidation = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
];

router.post('/register', upload.single('avatar'), mergeBodyAndQuery, registerValidation, register);
router.post('/login', upload.none(), mergeBodyAndQuery, loginValidation, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('avatar'), mergeBodyAndQuery, updateProfileValidation, updateProfile);

export default router;
