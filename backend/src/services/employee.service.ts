import { Types } from 'mongoose';
import { Employee, IEmployee } from '../models';

export class EmployeeService {
  async create(userId: string, data: Partial<IEmployee>) {
    const employee = new Employee({
      ...data,
      userId: new Types.ObjectId(userId),
    });
    return employee.save();
  }

  async getAll(userId: string) {
    return Employee.find({ userId: new Types.ObjectId(userId), isActive: true })
      .sort({ createdAt: -1 });
  }

  async getById(id: string) {
    return Employee.findById(id);
  }

  async update(id: string, data: Partial<IEmployee>) {
    return Employee.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string) {
    return Employee.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }
}

export const employeeService = new EmployeeService();
