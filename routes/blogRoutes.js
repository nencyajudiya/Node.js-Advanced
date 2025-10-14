import express from 'express';
import { body } from 'express-validator';
import { upload } from '../controllers/blogController.js';
import {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
    getUserBlogs,
} from '../controllers/blogController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllBlogs);
router.get('/:id', getBlogById);

router.post(
  '/',
  protect,
  upload.single('blog_image'),  
  [
    body('blog_title').notEmpty().withMessage('Title is required'),
    body('blog_description').notEmpty().withMessage('Description is required'),
    body('blog_status').optional().isIn(['draft', 'published']).withMessage('Invalid status'),
  ],
  createBlog
);

router.get('/user/me', protect, getUserBlogs);

router.put(
  '/:id',
  protect,
  upload.single('blog_image'), 
  [
    body('blog_title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('blog_description').optional().notEmpty().withMessage('Description cannot be empty'),
  ],
  updateBlog
);

router.delete('/:id', protect, deleteBlog);


export default router;