import { ConversationDocument, IConversation } from '../models/conversation.model';
import { CreateConversationRequest } from '../types';
declare class ConversationService {
    getConversations(userId: string, clientId: string): Promise<IConversation[]>;
    createConversation(userId: string, data: CreateConversationRequest): Promise<ConversationDocument>;
    deleteConversation(userId: string, conversationId: string): Promise<void>;
}
export declare const conversationService: ConversationService;
export {};
//# sourceMappingURL=conversation.service.d.ts.map