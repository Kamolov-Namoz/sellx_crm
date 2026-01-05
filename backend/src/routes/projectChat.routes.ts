import { Router, Response } from 'express';
import { projectChatService } from '../services/projectChat.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types';

const router = Router();

// Loyiha xabarlarini olish
router.get('/:projectId/messages', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const result = await projectChatService.getMessages(req.params.projectId, page, limit);
    
    // Xabarlarni o'qilgan deb belgilash
    await projectChatService.markAsRead(req.params.projectId, req.user!.userId);
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// Xabar yuborish
router.post('/:projectId/messages', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type, content, taskId, metadata } = req.body;
    
    const message = await projectChatService.sendMessage({
      projectId: req.params.projectId,
      senderId: req.user!.userId,
      senderRole: req.user!.role === 'developer' ? 'developer' : 'user',
      type,
      content,
      taskId,
      metadata,
    });
    
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// Loyiha ma'lumotlari (chat header uchun)
router.get('/:projectId/info', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const info = await projectChatService.getProjectInfo(req.params.projectId);
    if (!info) {
      res.status(404).json({ success: false, message: 'Loyiha topilmadi' });
      return;
    }
    res.json({ success: true, data: info });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// O'qilmagan xabarlar soni
router.get('/:projectId/unread', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const count = await projectChatService.getUnreadCount(req.params.projectId, req.user!.userId);
    res.json({ success: true, data: { count } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// Developer uchun barcha o'qilmagan xabarlar
router.get('/developer/unread-all', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== 'developer') {
      res.status(403).json({ success: false, message: 'Faqat dasturchilar uchun' });
      return;
    }
    const counts = await projectChatService.getDeveloperUnreadCounts(req.user.userId);
    res.json({ success: true, data: counts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

export default router;
