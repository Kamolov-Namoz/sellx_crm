import { User } from '../models';

export class EmployeeService {
  // Barcha developer rolidagi userlarni olish
  async getAll() {
    return User.find({ role: 'developer' })
      .select('_id firstName lastName username phoneNumber createdAt')
      .sort({ createdAt: -1 });
  }

  // Bitta developer ni olish
  async getById(id: string) {
    return User.findOne({ _id: id, role: 'developer' })
      .select('_id firstName lastName username phoneNumber createdAt');
  }
}

export const employeeService = new EmployeeService();
