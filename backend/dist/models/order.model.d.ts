import { Document } from 'mongoose';
import { IOrder } from '../types';
export interface OrderDocument extends Omit<IOrder, '_id'>, Document {
}
export declare const Order: any;
//# sourceMappingURL=order.model.d.ts.map