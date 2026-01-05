"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectChat_service_1 = require("../services/projectChat.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Loyiha xabarlarini olish
router.get('/:projectId/messages', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const result = await projectChat_service_1.projectChatService.getMessages(req.params.projectId, page, limit);
        // Xabarlarni o'qilgan deb belgilash
        await projectChat_service_1.projectChatService.markAsRead(req.params.projectId, req.user.userId);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// Xabar yuborish
router.post('/:projectId/messages', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const { type, content, taskId, metadata } = req.body;
        const message = await projectChat_service_1.projectChatService.sendMessage({
            projectId: req.params.projectId,
            senderId: req.user.userId,
            senderRole: req.user.role === 'developer' ? 'developer' : 'user',
            type,
            content,
            taskId,
            metadata,
        });
        res.status(201).json({ success: true, data: message });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// Loyiha ma'lumotlari (chat header uchun)
router.get('/:projectId/info', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const info = await projectChat_service_1.projectChatService.getProjectInfo(req.params.projectId, req.user.userId);
        if (!info) {
            res.status(404).json({ success: false, message: 'Loyiha topilmadi' });
            return;
        }
        res.json({ success: true, data: info });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// O'qilmagan xabarlar soni
router.get('/:projectId/unread', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const count = await projectChat_service_1.projectChatService.getUnreadCount(req.params.projectId, req.user.userId);
        res.json({ success: true, data: { count } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// Developer uchun barcha o'qilmagan xabarlar
router.get('/developer/unread-all', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        if (req.user?.role !== 'developer') {
            res.status(403).json({ success: false, message: 'Faqat dasturchilar uchun' });
            return;
        }
        const counts = await projectChat_service_1.projectChatService.getDeveloperUnreadCounts(req.user.userId);
        res.json({ success: true, data: counts });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
exports.default = router;
//# sourceMappingURL=projectChat.routes.js.map