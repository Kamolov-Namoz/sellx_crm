import { Router, Response } from 'express';
import { serviceCategoryService } from '../services/serviceCategory.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { AuthenticatedRequest } from '../types';

const router = Router();

// ==================== PUBLIC ROUTES (Seller uchun) ====================

// Barcha faol xizmatlarni olish (seller loyiha yaratishda ishlatadi)
router.get('/active', authMiddleware, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const categories = await serviceCategoryService.getAllActiveServices();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// Tanlangan xizmatlar narxini hisoblash
router.post('/calculate-price', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { serviceIds } = req.body;
    if (!Array.isArray(serviceIds)) {
      res.status(400).json({ success: false, message: 'serviceIds array bo\'lishi kerak' });
      return;
    }
    const result = await serviceCategoryService.calculateTotalPrice(serviceIds);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// ==================== ADMIN ROUTES ====================

// Barcha sohalarni olish (admin)
router.get('/', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const categories = await serviceCategoryService.getAll(includeInactive);
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// Bitta sohani olish
router.get('/:id', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const category = await serviceCategoryService.getById(req.params.id);
    if (!category) {
      res.status(404).json({ success: false, message: 'Soha topilmadi' });
      return;
    }
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// Yangi soha yaratish
router.post('/', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, icon } = req.body;
    if (!name?.trim()) {
      res.status(400).json({ success: false, message: 'Soha nomi kiritilishi shart' });
      return;
    }
    const category = await serviceCategoryService.create({ name: name.trim(), description, icon });
    res.status(201).json({ success: true, data: category });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: 'Bu nomdagi soha allaqachon mavjud' });
      return;
    }
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// Sohani yangilash
router.put('/:id', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, icon, isActive } = req.body;
    const category = await serviceCategoryService.update(req.params.id, { name, description, icon, isActive });
    if (!category) {
      res.status(404).json({ success: false, message: 'Soha topilmadi' });
      return;
    }
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// Sohani o'chirish
router.delete('/:id', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const category = await serviceCategoryService.delete(req.params.id);
    if (!category) {
      res.status(404).json({ success: false, message: 'Soha topilmadi' });
      return;
    }
    res.json({ success: true, message: 'Soha o\'chirildi' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// ==================== SERVICE ROUTES (Xizmatlar) ====================

// Sohaga xizmat qo'shish
router.post('/:id/services', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, price } = req.body;
    if (!name?.trim()) {
      res.status(400).json({ success: false, message: 'Xizmat nomi kiritilishi shart' });
      return;
    }
    if (price === undefined || price < 0) {
      res.status(400).json({ success: false, message: 'Narx kiritilishi shart' });
      return;
    }
    const category = await serviceCategoryService.addService(req.params.id, { name: name.trim(), description, price });
    res.status(201).json({ success: true, data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Xatolik yuz berdi' });
  }
});

// Xizmatni yangilash
router.put('/:id/services/:serviceId', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, price, isActive } = req.body;
    const category = await serviceCategoryService.updateService(req.params.id, req.params.serviceId, { name, description, price, isActive });
    res.json({ success: true, data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Xatolik yuz berdi' });
  }
});

// Xizmatni o'chirish
router.delete('/:id/services/:serviceId', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const category = await serviceCategoryService.deleteService(req.params.id, req.params.serviceId);
    res.json({ success: true, data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Xatolik yuz berdi' });
  }
});

export default router;
