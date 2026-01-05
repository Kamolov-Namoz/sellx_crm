import { Router, Response } from 'express';
import { projectTaskService } from '../services/projectTask.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types';

const router = Router();

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

// Yangi vazifa
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const task = await projectTaskService.create(req.body);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// Vazifani yangilash (progress) - developer o'zi yangilashi mumkin
router.put('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const task = await projectTaskService.update(req.params.id, req.body);
    if (!task) {
      res.status(404).json({ success: false, message: 'Vazifa topilmadi' });
      return;
    }
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// Vazifani o'chirish
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await projectTaskService.delete(req.params.id);
    res.json({ success: true, message: 'Vazifa o\'chirildi' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

export default router;
