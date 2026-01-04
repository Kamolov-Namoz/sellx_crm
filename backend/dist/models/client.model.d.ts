import { Document } from 'mongoose';
import { IClient } from '../types';
export interface ClientDocument extends Omit<IClient, '_id'>, Document {
}
export declare const Client: any;
//# sourceMappingURL=client.model.d.ts.map