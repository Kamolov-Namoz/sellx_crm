import { Document } from 'mongoose';
import { IScheduledReminder } from '../types';
export interface ReminderDocument extends Omit<IScheduledReminder, '_id'>, Document {
}
export declare const ScheduledReminder: any;
//# sourceMappingURL=reminder.model.d.ts.map