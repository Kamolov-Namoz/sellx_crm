"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const serviceCategory_service_1 = require("../services/serviceCategory.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const router = (0, express_1.Router)();
// ==================== PUBLIC ROUTES (Seller uchun) ====================
// Barcha faol xizmatlarni olish (seller loyiha yaratishda ishlatadi)
router.get('/active', auth_middleware_1.authMiddleware, async (_req, res) => {
    try {
        const categories = await serviceCategory_service_1.serviceCategoryService.getAllActiveServices();
        res.json({ success: true, data: categories });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// Tanlangan xizmatlar narxini hisoblash
router.post('/calculate-price', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const { serviceIds } = req.body;
        if (!Array.isArray(serviceIds)) {
            res.status(400).json({ success: false, message: 'serviceIds array bo\'lishi kerak' });
            return;
        }
        const result = await serviceCategory_service_1.serviceCategoryService.calculateTotalPrice(serviceIds);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// ==================== ADMIN ROUTES ====================
// Barcha sohalarni olish (admin)
router.get('/', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, async (req, res) => {
    try {
        const includeInactive = req.query.includeInactive === 'true';
        const categories = await serviceCategory_service_1.serviceCategoryService.getAll(includeInactive);
        res.json({ success: true, data: categories });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// Bitta sohani olish
router.get('/:id', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, async (req, res) => {
    try {
        const category = await serviceCategory_service_1.serviceCategoryService.getById(req.params.id);
        if (!category) {
            res.status(404).json({ success: false, message: 'Soha topilmadi' });
            return;
        }
        res.json({ success: true, data: category });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// Yangi soha yaratish
router.post('/', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, async (req, res) => {
    try {
        const { name, description, icon } = req.body;
        if (!name?.trim()) {
            res.status(400).json({ success: false, message: 'Soha nomi kiritilishi shart' });
            return;
        }
        const category = await serviceCategory_service_1.serviceCategoryService.create({ name: name.trim(), description, icon });
        res.status(201).json({ success: true, data: category });
    }
    catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ success: false, message: 'Bu nomdagi soha allaqachon mavjud' });
            return;
        }
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// Sohani yangilash
router.put('/:id', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, async (req, res) => {
    try {
        const { name, description, icon, isActive } = req.body;
        const category = await serviceCategory_service_1.serviceCategoryService.update(req.params.id, { name, description, icon, isActive });
        if (!category) {
            res.status(404).json({ success: false, message: 'Soha topilmadi' });
            return;
        }
        res.json({ success: true, data: category });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// Sohani o'chirish
router.delete('/:id', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, async (req, res) => {
    try {
        const category = await serviceCategory_service_1.serviceCategoryService.delete(req.params.id);
        if (!category) {
            res.status(404).json({ success: false, message: 'Soha topilmadi' });
            return;
        }
        res.json({ success: true, message: 'Soha o\'chirildi' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// ==================== SERVICE ROUTES (Xizmatlar) ====================
// Sohaga xizmat qo'shish
router.post('/:id/services', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, async (req, res) => {
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
        const category = await serviceCategory_service_1.serviceCategoryService.addService(req.params.id, { name: name.trim(), description, price });
        res.status(201).json({ success: true, data: category });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Xatolik yuz berdi' });
    }
});
// Xizmatni yangilash
router.put('/:id/services/:serviceId', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, async (req, res) => {
    try {
        const { name, description, price, isActive } = req.body;
        const category = await serviceCategory_service_1.serviceCategoryService.updateService(req.params.id, req.params.serviceId, { name, description, price, isActive });
        res.json({ success: true, data: category });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Xatolik yuz berdi' });
    }
});
// Xizmatni o'chirish
router.delete('/:id/services/:serviceId', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, async (req, res) => {
    try {
        const category = await serviceCategory_service_1.serviceCategoryService.deleteService(req.params.id, req.params.serviceId);
        res.json({ success: true, data: category });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Xatolik yuz berdi' });
    }
});
exports.default = router;
//# sourceMappingURL=serviceCategory.routes.js.map