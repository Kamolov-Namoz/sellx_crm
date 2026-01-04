import { Router, Response } from 'express';
import { employeeService } from '../services/employee.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types';

const router = Router();

// Barcha xodimlar
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employees = await employeeService.getAll(req.user!.userId);
    res.json({ success: true, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// Bitta xodim
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employee = await employeeService.getById(req.params.id);
    if (!employee) {
      res.status(404).json({ success: false, message: 'Xodim topilmadi' });
      return;
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// Yangi xodim
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employee = await employeeService.create(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// Xodimni yangilash
router.put('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employee = await employeeService.update(req.params.id, req.body);
    if (!employee) {
      res.status(404).json({ success: false, message: 'Xodim topilmadi' });
      return;
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// Xodimni o'chirish
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await employeeService.delete(req.params.id);
    res.json({ success: true, message: 'Xodim o\'chirildi' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

export default router;
