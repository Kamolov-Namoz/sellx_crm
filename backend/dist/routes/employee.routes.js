"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const employee_service_1 = require("../services/employee.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Barcha dasturchilar (developer rolidagi userlar)
router.get('/', auth_middleware_1.authMiddleware, async (_req, res) => {
    try {
        const developers = await employee_service_1.employeeService.getAll();
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
// Bitta dasturchi
router.get('/:id', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const developer = await employee_service_1.employeeService.getById(req.params.id);
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
    }
});
exports.default = router;
//# sourceMappingURL=employee.routes.js.map