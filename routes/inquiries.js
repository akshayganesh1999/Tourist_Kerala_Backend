import express from 'express';
import { body } from 'express-validator';
import {
  createInquiry,
  getInquiries,
  deleteInquiry,
  updateInquiryStatus,
} from '../controllers/inquiryController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const inquiryValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Valid Indian mobile number required'),
  body('district')
    .isIn(['Kannur', 'Kozhikode', 'Wayanad', 'Ernakulam', 'Idukki'])
    .withMessage('Valid district required'),
  body('place').trim().notEmpty().withMessage('Place is required'),
  body('area').optional().trim(),
];

router.post('/', inquiryValidation, createInquiry);
router.get('/', protect, getInquiries);
router.delete('/:id', protect, deleteInquiry);
router.patch('/:id/status', protect, updateInquiryStatus);

export default router;
