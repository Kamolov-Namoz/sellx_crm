import { Types } from 'mongoose';
import { IEmployee } from '../models';
export declare class EmployeeService {
    create(userId: string, data: Partial<IEmployee>): Promise<import("mongoose").Document<unknown, {}, IEmployee, {}, {}> & IEmployee & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getAll(userId: string): Promise<(import("mongoose").Document<unknown, {}, IEmployee, {}, {}> & IEmployee & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getById(id: string): Promise<(import("mongoose").Document<unknown, {}, IEmployee, {}, {}> & IEmployee & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    update(id: string, data: Partial<IEmployee>): Promise<(import("mongoose").Document<unknown, {}, IEmployee, {}, {}> & IEmployee & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    delete(id: string): Promise<(import("mongoose").Document<unknown, {}, IEmployee, {}, {}> & IEmployee & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
}
export declare const employeeService: EmployeeService;
//# sourceMappingURL=employee.service.d.ts.map