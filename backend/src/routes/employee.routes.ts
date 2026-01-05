import { Router, Response } from 'express';
import { employeeService } from '../services/employee.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types';

const router = Router();

// Barcha dasturchilar (developer rolidagi userlar)
router.get('/', authMiddleware, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const developers = await employeeService.getAll();
    // Frontend uchun format
    const data = developers.map(dev => ({
      _id: dev._id,
      fullName: `${dev.firstName} ${dev.lastName}`,
      position: 'Dasturchi',
      phoneNumber: dev.phoneNumber,
      username: dev.username,
      createdAt: dev.createdAt,
    }));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// Bitta dasturchi
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const developer = await employeeService.getById(req.params.id);
    if (!developer) {
      res.status(404).json({ success: false, message: 'Dasturchi topilmadi' });
      return;
    }
    const data = {
      _id: developer._id,
      fullName: `${developer.firstName} ${developer.lastName}`,
      position: 'Dasturchi',
      phoneNumber: developer.phoneNumber,
      username: developer.username,
      createdAt: developer.createdAt,
    };
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

export default router;
