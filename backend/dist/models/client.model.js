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
exports.Client = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const CLIENT_STATUSES = ['new', 'thinking', 'agreed', 'rejected', 'callback'];
const clientSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true,
    },
    fullName: {
        type: String,
        trim: true,
        maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    companyName: {
        type: String,
        trim: true,
        maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
    },
    location: {
        address: {
            type: String,
            trim: true,
            maxlength: [200, 'Address cannot exceed 200 characters'],
        },
        latitude: {
            type: Number,
            required: [true, 'Latitude is required'],
        },
        longitude: {
            type: Number,
            required: [true, 'Longitude is required'],
        },
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    status: {
        type: String,
        enum: {
            values: CLIENT_STATUSES,
            message: 'Status must be one of: ' + CLIENT_STATUSES.join(', '),
        },
        default: 'new',
    },
    followUpDate: {
        type: Date,
    },
    lastConversationSummary: {
        type: String,
        trim: true,
        maxlength: [500, 'Summary cannot exceed 500 characters'],
    },
}, {
    timestamps: true,
});
// Compound indexes for query optimization
clientSchema.index({ userId: 1, status: 1 });
clientSchema.index({ userId: 1, followUpDate: 1 });
clientSchema.index({ userId: 1, createdAt: -1 });
// Geospatial index for map queries
clientSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
exports.Client = mongoose_1.default.model('Client', clientSchema);
//# sourceMappingURL=client.model.js.map