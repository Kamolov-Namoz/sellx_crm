import mongoose, { Document } from 'mongoose';
import { IUser } from '../types';
export interface UserDocument extends Omit<IUser, '_id'>, Document {
}
export declare const User: mongoose.Model<UserDocument, {}, {}, {}, mongoose.Document<unknown, {}, UserDocument, {}, {}> & UserDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=user.model.d.ts.map