"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectTask_service_1 = require("../services/projectTask.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
const models_1 = require("../models");
const router = (0, express_1.Router)();
// Helper: Foydalanuvchi loyihaga ruxsati bormi (seller yoki team lead)
async function canManageTasks(userId, projectId) {
    const order = await models_1.Order.findById(projectId);
    if (!order)
        return false;
    // Seller (loyiha egasi)
    const orderUser = order.userId;
    const orderUserId = typeof orderUser === 'object' && orderUser._id
        ? orderUser._id.toString()
        : orderUser.toString();
    if (orderUserId === userId)
        return true;
    // Team Lead
    if (order.teamLeadId) {
        const teamLead = order.teamLeadId;
        const teamLeadIdStr = typeof teamLead === 'object' && teamLead._id
            ? teamLead._id.toString()
            : teamLead.toString();
        if (teamLeadIdStr === userId)
            return true;
    }
    return false;
}
// Loyihaning vazifalari
router.get('/project/:projectId', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const result = await projectTask_service_1.projectTaskService.getProjectProgress(req.params.projectId);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// Bosqich (milestone) bo'yicha vazifalar va progress
router.get('/project/:projectId/milestone/:milestoneId', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const result = await projectTask_service_1.projectTaskService.getMilestoneProgress(req.params.projectId, req.params.milestoneId);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// Developer uchun o'z vazifalari
router.get('/my-tasks', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        if (req.user?.role !== 'developer') {
            res.status(403).json({ success: false, message: 'Faqat dasturchilar uchun' });
            return;
        }
        const tasks = await projectTask_service_1.projectTaskService.getByDeveloper(req.user.userId);
        res.json({ success: true, data: tasks });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// Developer statistikasi
router.get('/my-stats', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        if (req.user?.role !== 'developer') {
            res.status(403).json({ success: false, message: 'Faqat dasturchilar uchun' });
            return;
        }
        const stats = await projectTask_service_1.projectTaskService.getDeveloperStats(req.user.userId);
        res.json({ success: true, data: stats });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// Developer loyihalari
router.get('/my-projects', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        if (req.user?.role !== 'developer') {
            res.status(403).json({ success: false, message: 'Faqat dasturchilar uchun' });
            return;
        }
        const projects = await projectTask_service_1.projectTaskService.getDeveloperProjects(req.user.userId);
        res.json({ success: true, data: projects });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// Developer portfolio
router.get('/my-portfolio', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        if (req.user?.role !== 'developer') {
            res.status(403).json({ success: false, message: 'Faqat dasturchilar uchun' });
            return;
        }
        const portfolio = await projectTask_service_1.projectTaskService.getDeveloperPortfolio(req.user.userId);
        res.json({ success: true, data: portfolio });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// Vazifani tasdiqlash (Accept) - developer bajarib bo'lganda
router.post('/:id/accept', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        if (req.user?.role !== 'developer') {
            res.status(403).json({ success: false, message: 'Faqat dasturchilar uchun' });
            return;
        }
        const task = await projectTask_service_1.projectTaskService.acceptTask(req.params.id, req.user.userId);
        res.json({ success: true, data: task });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// Dasturchining vazifalari (admin/seller ko'rishi uchun)
router.get('/developer/:developerId', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const tasks = await projectTask_service_1.projectTaskService.getByDeveloper(req.params.developerId);
        res.json({ success: true, data: tasks });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// Yangi vazifa - Seller yoki Team Lead yarata oladi
router.post('/', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const { projectId } = req.body;
        // Ruxsatni tekshirish
        const hasAccess = await canManageTasks(req.user.userId, projectId);
        if (!hasAccess) {
            res.status(403).json({ success: false, message: 'Sizda vazifa yaratish huquqi yo\'q' });
            return;
        }
        const task = await projectTask_service_1.projectTaskService.create(req.body);
        res.status(201).json({ success: true, data: task });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// Vazifani yangilash - Seller, Team Lead yoki vazifa egasi (developer)
router.put('/:id', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        // Avval vazifani olish
        const existingTask = await projectTask_service_1.projectTaskService.getById(req.params.id);
        if (!existingTask) {
            res.status(404).json({ success: false, message: 'Vazifa topilmadi' });
            return;
        }
        // Ruxsatni tekshirish
        const isOwner = existingTask.developerId.toString() === req.user.userId;
        const hasAccess = await canManageTasks(req.user.userId, existingTask.projectId.toString());
        if (!isOwner && !hasAccess) {
            res.status(403).json({ success: false, message: 'Sizda vazifani yangilash huquqi yo\'q' });
            return;
        }
        const task = await projectTask_service_1.projectTaskService.update(req.params.id, req.body);
        res.json({ success: true, data: task });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// Vazifani o'chirish - faqat Seller yoki Team Lead
router.delete('/:id', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        // Avval vazifani olish
        const existingTask = await projectTask_service_1.projectTaskService.getById(req.params.id);
        if (!existingTask) {
            res.status(404).json({ success: false, message: 'Vazifa topilmadi' });
            return;
        }
        // Ruxsatni tekshirish
        const hasAccess = await canManageTasks(req.user.userId, existingTask.projectId.toString());
        if (!hasAccess) {
            res.status(403).json({ success: false, message: 'Sizda vazifani o\'chirish huquqi yo\'q' });
            return;
        }
        await projectTask_service_1.projectTaskService.delete(req.params.id);
        res.json({ success: true, message: 'Vazifa o\'chirildi' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
exports.default = router;
//# sourceMappingURL=projectTask.routes.js.map