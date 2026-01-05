"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_service_1 = require("../services/notification.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Notificationlarni olish
router.get('/', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const result = await notification_service_1.notificationService.getByUser(req.user.userId, page, limit);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// O'qilmagan notificationlar soni
router.get('/unread-count', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const count = await notification_service_1.notificationService.getUnreadCount(req.user.userId);
        res.json({ success: true, data: { count } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// Notificationni o'qilgan deb belgilash
router.patch('/:id/read', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const notification = await notification_service_1.notificationService.markAsRead(req.params.id, req.user.userId);
        if (!notification) {
            res.status(404).json({ success: false, message: 'Notification topilmadi' });
            return;
        }
        res.json({ success: true, data: notification });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// Barcha notificationlarni o'qilgan deb belgilash
router.patch('/read-all', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        await notification_service_1.notificationService.markAllAsRead(req.user.userId);
        res.json({ success: true, message: 'Barcha notificationlar o\'qildi' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
exports.default = router;
//# sourceMappingURL=notification.routes.js.map