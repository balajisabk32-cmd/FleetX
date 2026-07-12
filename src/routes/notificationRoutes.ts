import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Get all notifications (Manager and Admin only)
router.get('/', authenticateToken, requireRole(['Admin', 'Manager']), async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(notifications);
  } catch (error) {
    next(error);
  }
});

// Mark notifications as read
router.put('/mark-read', authenticateToken, requireRole(['Admin', 'Manager']), async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
});

export default router;
