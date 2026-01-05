import { Router, Response } from 'express';
import { notificationService } from '../services/notification.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types';

const router = Router();

// Notificationlarni olish
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const result = await notificationService.getByUser(req.user!.userId, page, limit);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// O'qilmagan notificationlar soni
router.get('/unread-count', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const count = await notificationService.getUnreadCount(req.user!.userId);
    res.json({ success: true, data: { count } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// Notificationni o'qilgan deb belgilash
router.patch('/:id/read', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user!.userId);
    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification topilmadi' });
      return;
    }
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// Barcha notificationlarni o'qilgan deb belgilash
router.patch('/read-all', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await notificationService.markAllAsRead(req.user!.userId);
    res.json({ success: true, message: 'Barcha notificationlar o\'qildi' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

export default router;
