import mongoose, { Document } from 'mongoose';
import { IOrder } from '../types';
export interface IMilestone {
    _id?: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    amount: number;
    percentage: number;
    dueDate?: Date;
    status: 'pending' | 'in_progress' | 'completed' | 'paid';
    completedAt?: Date;
    paidAt?: Date;
    tasks?: string[];
}
export interface ITeamMember {
    developerId: mongoose.Types.ObjectId;
    role: 'developer' | 'team_lead';
    joinedAt: Date;
}
export interface OrderDocument extends Omit<IOrder, '_id'>, Document {
    milestones?: IMilestone[];
    totalPaid?: number;
    team?: ITeamMember[];
    teamLeadId?: mongoose.Types.ObjectId;
}
export declare const Order: mongoose.Model<OrderDocument, {}, {}, {}, mongoose.Document<unknown, {}, OrderDocument, {}, {}> & OrderDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=order.model.d.ts.map