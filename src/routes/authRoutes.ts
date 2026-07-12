import { Router } from 'express';
import { register, login, getMe, googleLogin, logout } from '../controllers/authController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/logout', logout);
router.get('/me', authenticateToken, getMe);

export default router;
