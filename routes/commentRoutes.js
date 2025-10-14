import express from 'express';
import { body } from 'express-validator';
import { upload } from '../controllers/blogController.js';
import { addComment, getComments } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', 
    protect, 
    upload.single('attachment'), 
    [
        body('blogId').notEmpty().withMessage('Blog ID is required'),
        body().custom((value, { req }) => {
            if (!req.body.comment && !req.body.text) {
                throw new Error('Either comment or text field is required');
            }
            return true;
        }),
    ],
    addComment
);
router.get('/:blogId', getComments);

export default router;