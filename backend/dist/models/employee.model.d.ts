import mongoose, { Document } from 'mongoose';
export interface IEmployee extends Document {
    userId: mongoose.Types.ObjectId;
    fullName: string;
    position: string;
    phoneNumber?: string;
    email?: string;
    avatar?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Employee: mongoose.Model<IEmployee, {}, {}, {}, mongoose.Document<unknown, {}, IEmployee, {}, {}> & IEmployee & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=employee.model.d.ts.map