"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const employee_service_1 = require("../services/employee.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Barcha xodimlar
router.get('/', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const employees = await employee_service_1.employeeService.getAll(req.user.userId);
        res.json({ success: true, data: employees });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// Bitta xodim
router.get('/:id', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const employee = await employee_service_1.employeeService.getById(req.params.id);
        if (!employee) {
            res.status(404).json({ success: false, message: 'Xodim topilmadi' });
            return;
        }
        res.json({ success: true, data: employee });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// Yangi xodim
router.post('/', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const employee = await employee_service_1.employeeService.create(req.user.userId, req.body);
        res.status(201).json({ success: true, data: employee });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// Xodimni yangilash
router.put('/:id', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const employee = await employee_service_1.employeeService.update(req.params.id, req.body);
        if (!employee) {
            res.status(404).json({ success: false, message: 'Xodim topilmadi' });
            return;
        }
        res.json({ success: true, data: employee });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// Xodimni o'chirish
router.delete('/:id', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        await employee_service_1.employeeService.delete(req.params.id);
        res.json({ success: true, message: 'Xodim o\'chirildi' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
exports.default = router;
//# sourceMappingURL=employee.routes.js.map