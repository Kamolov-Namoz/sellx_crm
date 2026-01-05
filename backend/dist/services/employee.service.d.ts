export declare class EmployeeService {
    getAll(): Promise<(import("mongoose").Document<unknown, {}, import("../models").UserDocument, {}, {}> & import("../models").UserDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getById(id: string): Promise<(import("mongoose").Document<unknown, {}, import("../models").UserDocument, {}, {}> & import("../models").UserDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
}
export declare const employeeService: EmployeeService;
//# sourceMappingURL=employee.service.d.ts.map