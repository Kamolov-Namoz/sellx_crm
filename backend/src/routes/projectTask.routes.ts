import { Router, Response } from 'express';
import { projectTaskService } from '../services/projectTask.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types';
import { Order } from '../models';

const router = Router();

// Helper: Foydalanuvchi loyihaga ruxsati bormi (seller yoki team lead)
async function canManageTasks(userId: string, projectId: string): Promise<boolean> {
  const order = await Order.findById(projectId);
  if (!order) return false;
  
  // Seller (loyiha egasi)
  const orderUser = order.userId as any;
  const orderUserId = typeof orderUser === 'object' && orderUser._id
    ? orderUser._id.toString()
    : orderUser.toString();
  if (orderUserId === userId) return true;
  
  // Team Lead
  if (order.teamLeadId) {
    const teamLead = order.teamLeadId as any;
    const teamLeadIdStr = typeof teamLead === 'object' && teamLead._id
      ? teamLead._id.toString()
      : teamLead.toString();
    if (teamLeadIdStr === userId) return true;
  }
  
  return false;
}

// Loyihaning vazifalari
router.get('/project/:projectId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await projectTaskService.getProjectProgress(req.params.projectId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// Bosqich (milestone) bo'yicha vazifalar va progress
router.get('/project/:projectId/milestone/:milestoneId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await projectTaskService.getMilestoneProgress(req.params.projectId, req.params.milestoneId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// Developer uchun o'z vazifalari
router.get('/my-tasks', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== 'developer') {
      res.status(403).json({ success: false, message: 'Faqat dasturchilar uchun' });
      return;
    }
    const tasks = await projectTaskService.getByDeveloper(req.user.userId);
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// Developer statistikasi
router.get('/my-stats', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== 'developer') {
      res.status(403).json({ success: false, message: 'Faqat dasturchilar uchun' });
      return;
    }
    const stats = await projectTaskService.getDeveloperStats(req.user.userId);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// Developer loyihalari
router.get('/my-projects', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== 'developer') {
      res.status(403).json({ success: false, message: 'Faqat dasturchilar uchun' });
      return;
    }
    const projects = await projectTaskService.getDeveloperProjects(req.user.userId);
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// Developer portfolio
router.get('/my-portfolio', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== 'developer') {
      res.status(403).json({ success: false, message: 'Faqat dasturchilar uchun' });
      return;
    }
    const portfolio = await projectTaskService.getDeveloperPortfolio(req.user.userId);
    res.json({ success: true, data: portfolio });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// Vazifani tasdiqlash (Accept) - developer bajarib bo'lganda
router.post('/:id/accept', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== 'developer') {
      res.status(403).json({ success: false, message: 'Faqat dasturchilar uchun' });
      return;
    }
    const task = await projectTaskService.acceptTask(req.params.id, req.user.userId);
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// Dasturchining vazifalari (admin/seller ko'rishi uchun)
router.get('/developer/:developerId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tasks = await projectTaskService.getByDeveloper(req.params.developerId);
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// Yangi vazifa - Seller yoki Team Lead yarata oladi
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { projectId } = req.body;
    
    // Ruxsatni tekshirish
    const hasAccess = await canManageTasks(req.user!.userId, projectId);
    if (!hasAccess) {
      res.status(403).json({ success: false, message: 'Sizda vazifa yaratish huquqi yo\'q' });
      return;
    }
    
    const task = await projectTaskService.create(req.body);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// Vazifani yangilash - Seller, Team Lead yoki vazifa egasi (developer)
router.put('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Avval vazifani olish
    const existingTask = await projectTaskService.getById(req.params.id);
    if (!existingTask) {
      res.status(404).json({ success: false, message: 'Vazifa topilmadi' });
      return;
    }
    
    // Ruxsatni tekshirish
    const isOwner = existingTask.developerId.toString() === req.user!.userId;
    const hasAccess = await canManageTasks(req.user!.userId, existingTask.projectId.toString());
    
    if (!isOwner && !hasAccess) {
      res.status(403).json({ success: false, message: 'Sizda vazifani yangilash huquqi yo\'q' });
      return;
    }
    
    const task = await projectTaskService.update(req.params.id, req.body);
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// Vazifani o'chirish - faqat Seller yoki Team Lead
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Avval vazifani olish
    const existingTask = await projectTaskService.getById(req.params.id);
    if (!existingTask) {
      res.status(404).json({ success: false, message: 'Vazifa topilmadi' });
      return;
    }
    
    // Ruxsatni tekshirish
    const hasAccess = await canManageTasks(req.user!.userId, existingTask.projectId.toString());
    if (!hasAccess) {
      res.status(403).json({ success: false, message: 'Sizda vazifani o\'chirish huquqi yo\'q' });
      return;
    }
    
    await projectTaskService.delete(req.params.id);
    res.json({ success: true, message: 'Vazifa o\'chirildi' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

export default router;
