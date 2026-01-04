import { Document } from 'mongoose';
import { IUser } from '../types';
export interface UserDocument extends Omit<IUser, '_id'>, Document {
}
export declare const User: any;
//# sourceMappingURL=user.model.d.ts.map