"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientService = exports.ClientService = void 0;
const mongoose_1 = require("mongoose");
const models_1 = require("../models");
const error_middleware_1 = require("../middleware/error.middleware");
class ClientService {
    /**
     * Get all clients for a user with filtering, sorting, search and pagination
     */
    async getClients(userId, query) {
        const filter = { userId: new mongoose_1.Types.ObjectId(userId) };
        // Apply status filter
        if (query.status) {
            filter.status = query.status;
        }
        // Apply search filter
        if (query.search) {
            filter.$or = [
                { fullName: { $regex: query.search, $options: 'i' } },
                { phoneNumber: { $regex: query.search, $options: 'i' } },
                { location: { $regex: query.search, $options: 'i' } },
                { brandName: { $regex: query.search, $options: 'i' } },
            ];
        }
        // Build sort options
        let sortField = 'createdAt';
        if (query.sortBy === 'followUpDate') {
            sortField = 'followUpDate';
        }
        else if (query.sortBy === 'name') {
            sortField = 'fullName';
        }
        const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
        // Pagination
        const page = Math.max(1, query.page || 1);
        const limit = Math.min(100, Math.max(1, query.limit || 20));
        const skip = (page - 1) * limit;
        // Get total count
        const total = await models_1.Client.countDocuments(filter);
        const clients = await models_1.Client.find(filter)
            .sort({ [sortField]: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean();
        return {
            data: clients,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total,
                filters: {
                    status: query.status || null,
                    search: query.search || null,
                    sortBy: query.sortBy || 'createdAt',
                    sortOrder: query.sortOrder || 'desc',
                },
            },
        };
    }
    /**
     * Get dashboard statistics
     */
    async getStats(userId) {
        const userObjectId = new mongoose_1.Types.ObjectId(userId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [totalClients, todayFollowUps, statusCounts] = await Promise.all([
            models_1.Client.countDocuments({ userId: userObjectId }),
            models_1.Client.countDocuments({
                userId: userObjectId,
                followUpDate: { $gte: today, $lt: tomorrow },
            }),
            models_1.Client.aggregate([
                { $match: { userId: userObjectId } },
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
        ]);
        const statusMap = {};
        statusCounts.forEach((s) => {
            statusMap[s._id] = s.count;
        });
        return {
            totalClients,
            todayFollowUps,
            byStatus: statusMap,
        };
    }
    /**
     * Get single client by ID
     */
    async getClient(userId, clientId) {
        const client = await models_1.Client.findOne({
            _id: new mongoose_1.Types.ObjectId(clientId),
            userId: new mongoose_1.Types.ObjectId(userId),
        }).lean();
        if (!client) {
            throw new error_middleware_1.AppError('Client not found', 404, 'RESOURCE_NOT_FOUND');
        }
        return client;
    }
    /**
     * Create new client
     */
    async createClient(userId, data) {
        const client = await models_1.Client.create({
            userId: new mongoose_1.Types.ObjectId(userId),
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            location: data.location,
            brandName: data.brandName,
            notes: data.notes,
            status: data.status,
            followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
        });
        // Create reminder if follow-up date is set
        if (data.followUpDate) {
            await this.createReminder(userId, client._id.toString(), new Date(data.followUpDate));
        }
        return client.toObject();
    }
    /**
     * Update client
     */
    async updateClient(userId, clientId, data) {
        const client = await models_1.Client.findOne({
            _id: new mongoose_1.Types.ObjectId(clientId),
            userId: new mongoose_1.Types.ObjectId(userId),
        });
        if (!client) {
            throw new error_middleware_1.AppError('Client not found', 404, 'RESOURCE_NOT_FOUND');
        }
        // Track if follow-up date changed
        const oldFollowUpDate = client.followUpDate;
        let newFollowUpDate = undefined;
        if (data.followUpDate !== undefined) {
            newFollowUpDate = data.followUpDate ? new Date(data.followUpDate) : null;
        }
        // Update fields
        if (data.fullName !== undefined)
            client.fullName = data.fullName;
        if (data.phoneNumber !== undefined)
            client.phoneNumber = data.phoneNumber;
        if (data.location !== undefined)
            client.location = data.location;
        if (data.brandName !== undefined)
            client.brandName = data.brandName || undefined;
        if (data.notes !== undefined)
            client.notes = data.notes || undefined;
        if (data.status !== undefined)
            client.status = data.status;
        if (newFollowUpDate !== undefined) {
            client.followUpDate = newFollowUpDate || undefined;
        }
        await client.save();
        // Update reminder if follow-up date changed
        if (newFollowUpDate !== undefined && newFollowUpDate?.getTime() !== oldFollowUpDate?.getTime()) {
            // Cancel old reminder
            await this.cancelReminder(clientId);
            // Create new reminder if date is set
            if (newFollowUpDate) {
                await this.createReminder(userId, clientId, newFollowUpDate);
            }
        }
        return client.toObject();
    }
    /**
     * Delete client and associated reminders and conversations
     */
    async deleteClient(userId, clientId) {
        const client = await models_1.Client.findOne({
            _id: new mongoose_1.Types.ObjectId(clientId),
            userId: new mongoose_1.Types.ObjectId(userId),
        });
        if (!client) {
            throw new error_middleware_1.AppError('Client not found', 404, 'RESOURCE_NOT_FOUND');
        }
        const clientObjectId = new mongoose_1.Types.ObjectId(clientId);
        // Delete associated reminders
        await models_1.ScheduledReminder.deleteMany({ clientId: clientObjectId });
        // Delete associated conversations
        await models_1.Conversation.deleteMany({ clientId: clientObjectId });
        // Delete client
        await models_1.Client.deleteOne({ _id: client._id });
        return { success: true, message: 'Client deleted successfully' };
    }
    /**
     * Create a reminder for a client
     */
    async createReminder(userId, clientId, scheduledTime) {
        await models_1.ScheduledReminder.create({
            userId: new mongoose_1.Types.ObjectId(userId),
            clientId: new mongoose_1.Types.ObjectId(clientId),
            scheduledTime,
            status: 'pending',
        });
    }
    /**
     * Cancel all pending reminders for a client
     */
    async cancelReminder(clientId) {
        await models_1.ScheduledReminder.updateMany({
            clientId: new mongoose_1.Types.ObjectId(clientId),
            status: 'pending',
        }, { status: 'cancelled' });
    }
}
exports.ClientService = ClientService;
exports.clientService = new ClientService();
//# sourceMappingURL=client.service.js.map