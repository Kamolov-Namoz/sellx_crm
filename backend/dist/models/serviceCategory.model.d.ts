import mongoose, { Document } from 'mongoose';
export interface IService {
    _id?: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    price: number;
    isActive: boolean;
}
export interface IServiceCategory extends Document {
    name: string;
    description?: string;
    icon?: string;
    services: IService[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ServiceCategory: mongoose.Model<IServiceCategory, {}, {}, {}, mongoose.Document<unknown, {}, IServiceCategory, {}, {}> & IServiceCategory & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=serviceCategory.model.d.ts.map