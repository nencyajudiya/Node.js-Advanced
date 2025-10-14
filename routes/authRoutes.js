import express from 'express';
import { register, login, getMe } from '../controllers/AuthController.js';
import { body } from 'express-validator';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';

const router = express.Router();

const upload = multer();


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

router.post('/register', upload.none(), mergeBodyAndQuery, registerValidation, register);
router.post('/login', upload.none(), mergeBodyAndQuery, loginValidation, login);
router.get('/me', protect, getMe);

export default router;
