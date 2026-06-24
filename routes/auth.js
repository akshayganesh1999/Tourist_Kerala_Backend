import express from 'express';
import { adminLogin } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', adminLogin);
router.get('/verify', protect, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

export default router;
