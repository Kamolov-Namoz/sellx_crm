"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectTask_service_1 = require("../services/projectTask.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
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
// Xodimning vazifalari
router.get('/employee/:employeeId', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const tasks = await projectTask_service_1.projectTaskService.getByEmployee(req.params.employeeId);
        res.json({ success: true, data: tasks });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// Yangi vazifa
router.post('/', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const task = await projectTask_service_1.projectTaskService.create(req.body);
        res.status(201).json({ success: true, data: task });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// Vazifani yangilash (progress)
router.put('/:id', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const task = await projectTask_service_1.projectTaskService.update(req.params.id, req.body);
        if (!task) {
            res.status(404).json({ success: false, message: 'Vazifa topilmadi' });
            return;
        }
        res.json({ success: true, data: task });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// Vazifani o'chirish
router.delete('/:id', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        await projectTask_service_1.projectTaskService.delete(req.params.id);
        res.json({ success: true, message: 'Vazifa o\'chirildi' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
exports.default = router;
//# sourceMappingURL=projectTask.routes.js.map