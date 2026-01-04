import mongoose, { Document } from 'mongoose';
import { IOrder } from '../types';
export interface OrderDocument extends Omit<IOrder, '_id'>, Document {
}
export declare const Order: mongoose.Model<OrderDocument, {}, {}, {}, mongoose.Document<unknown, {}, OrderDocument, {}, {}> & OrderDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=order.model.d.ts.map