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
exports.Order = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ORDER_STATUSES = ['in_progress', 'completed'];
const milestoneSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String },
    amount: { type: Number, required: true, min: 0 },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    dueDate: { type: Date },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'paid'],
        default: 'pending'
    },
    completedAt: { type: Date },
    paidAt: { type: Date },
    tasks: [{ type: String }],
}, { _id: true });
const teamMemberSchema = new mongoose_1.Schema({
    developerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['developer', 'team_lead'], default: 'developer' },
    joinedAt: { type: Date, default: Date.now },
}, { _id: false });
const orderSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true,
    },
    clientId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Client',
        required: [true, 'Client ID is required'],
        index: true,
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        minlength: [2, 'Title must be at least 2 characters'],
        maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    amount: {
        type: Number,
        min: [0, 'Amount cannot be negative'],
    },
    status: {
        type: String,
        enum: {
            values: ORDER_STATUSES,
            message: 'Status must be one of: ' + ORDER_STATUSES.join(', '),
        },
        default: 'in_progress',
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    milestones: [milestoneSchema],
    totalPaid: {
        type: Number,
        default: 0,
        min: 0,
    },
    team: [teamMemberSchema],
    teamLeadId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});
// Compound indexes
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ clientId: 1, createdAt: -1 });
exports.Order = mongoose_1.default.model('Order', orderSchema);
//# sourceMappingURL=order.model.js.map