"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeService = exports.EmployeeService = void 0;
const models_1 = require("../models");
class EmployeeService {
    // Barcha developer rolidagi userlarni olish
    async getAll() {
        return models_1.User.find({ role: 'developer' })
            .select('_id firstName lastName username phoneNumber createdAt')
            .sort({ createdAt: -1 });
    }
    // Bitta developer ni olish
    async getById(id) {
        return models_1.User.findOne({ _id: id, role: 'developer' })
            .select('_id firstName lastName username phoneNumber createdAt');
    }
}
exports.EmployeeService = EmployeeService;
exports.employeeService = new EmployeeService();
//# sourceMappingURL=employee.service.js.map