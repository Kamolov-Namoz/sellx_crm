"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeService = exports.EmployeeService = void 0;
const mongoose_1 = require("mongoose");
const models_1 = require("../models");
class EmployeeService {
    async create(userId, data) {
        const employee = new models_1.Employee({
            ...data,
            userId: new mongoose_1.Types.ObjectId(userId),
        });
        return employee.save();
    }
    async getAll(userId) {
        return models_1.Employee.find({ userId: new mongoose_1.Types.ObjectId(userId), isActive: true })
            .sort({ createdAt: -1 });
    }
    async getById(id) {
        return models_1.Employee.findById(id);
    }
    async update(id, data) {
        return models_1.Employee.findByIdAndUpdate(id, data, { new: true });
    }
    async delete(id) {
        return models_1.Employee.findByIdAndUpdate(id, { isActive: false }, { new: true });
    }
}
exports.EmployeeService = EmployeeService;
exports.employeeService = new EmployeeService();
//# sourceMappingURL=employee.service.js.map