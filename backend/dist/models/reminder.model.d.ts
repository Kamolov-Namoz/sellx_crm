import mongoose, { Document } from 'mongoose';
import { IScheduledReminder } from '../types';
export interface ReminderDocument extends Omit<IScheduledReminder, '_id'>, Document {
}
export declare const ScheduledReminder: mongoose.Model<ReminderDocument, {}, {}, {}, mongoose.Document<unknown, {}, ReminderDocument, {}, {}> & ReminderDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=reminder.model.d.ts.map