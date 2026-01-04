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

// Xodimning vazifalari
router.get('/employee/:employeeId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tasks = await projectTaskService.getByEmployee(req.params.employeeId);
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

// Vazifani yangilash (progress)
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
