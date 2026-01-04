import mongoose, { Document } from 'mongoose';
import { IClient } from '../types';
export interface ClientDocument extends Omit<IClient, '_id'>, Document {
}
export declare const Client: mongoose.Model<ClientDocument, {}, {}, {}, mongoose.Document<unknown, {}, ClientDocument, {}, {}> & ClientDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=client.model.d.ts.map