"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conversation = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const conversationSchema = new mongoose_1.Schema({
    clientId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Client',
        required: [true, 'Client ID is required'],
        index: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true,
    },
    type: {
        type: String,
        enum: ['text', 'audio', 'image', 'video'],
        required: [true, 'Conversation type is required'],
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
    },
    summary: {
        type: String,
        required: [true, 'Summary is required'],
        trim: true,
        maxlength: [2000, 'Summary cannot exceed 2000 characters'],
    },
    nextFollowUpDate: {
        type: Date,
    },
    metadata: {
        fileName: String,
        fileSize: Number,
        duration: Number,
        mimeType: String,
    },
}, {
    timestamps: true,
});
// Compound indexes
conversationSchema.index({ clientId: 1, createdAt: -1 });
conversationSchema.index({ userId: 1, clientId: 1 });
exports.Conversation = mongoose_1.default.model('Conversation', conversationSchema);
//# sourceMappingURL=conversation.model.js.map