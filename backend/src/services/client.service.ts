import { Types } from 'mongoose';
import { Client, Conversation, ScheduledReminder } from '../models';
import { CreateClientRequest, UpdateClientRequest, GetClientsQuery, ClientStatus } from '../types';
import { AppError } from '../middleware/error.middleware';

export class ClientService {
  /**
   * Get all clients for a user with filtering, sorting, search and pagination
   */
  async getClients(userId: string, query: GetClientsQuery) {
    const filter: Record<string, unknown> = { userId: new Types.ObjectId(userId) };

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
    } else if (query.sortBy === 'name') {
      sortField = 'fullName';
    }

    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    // Get total count
    const total = await Client.countDocuments(filter);

    const clients = await Client.find(filter)
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
  async getStats(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalClients, todayFollowUps, statusCounts] = await Promise.all([
      Client.countDocuments({ userId: userObjectId }),
      Client.countDocuments({
        userId: userObjectId,
        followUpDate: { $gte: today, $lt: tomorrow },
      }),
      Client.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const statusMap: Record<string, number> = {};
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
  async getClient(userId: string, clientId: string) {
    const client = await Client.findOne({
      _id: new Types.ObjectId(clientId),
      userId: new Types.ObjectId(userId),
    }).lean();

    if (!client) {
      throw new AppError('Client not found', 404, 'RESOURCE_NOT_FOUND');
    }

    return client;
  }

  /**
   * Create new client
   */
  async createClient(userId: string, data: CreateClientRequest) {
    const client = await Client.create({
      userId: new Types.ObjectId(userId),
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
  async updateClient(userId: string, clientId: string, data: UpdateClientRequest) {
    const client = await Client.findOne({
      _id: new Types.ObjectId(clientId),
      userId: new Types.ObjectId(userId),
    });

    if (!client) {
      throw new AppError('Client not found', 404, 'RESOURCE_NOT_FOUND');
    }

    // Track if follow-up date changed
    const newFollowUpDate = data.followUpDate ? new Date(data.followUpDate) : undefined;

    // Update fields
    if (data.fullName !== undefined) client.fullName = data.fullName;
    if (data.phoneNumber !== undefined) client.phoneNumber = data.phoneNumber;
    if (data.location !== undefined) client.location = data.location;
    if (data.brandName !== undefined) client.brandName = data.brandName;
    if (data.notes !== undefined) client.notes = data.notes;
    if (data.status !== undefined) client.status = data.status as ClientStatus;
    if (data.followUpDate !== undefined) client.followUpDate = newFollowUpDate;

    await client.save();

    // Update reminder if follow-up date changed
    if (data.followUpDate !== undefined) {
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
  async deleteClient(userId: string, clientId: string) {
    const client = await Client.findOne({
      _id: new Types.ObjectId(clientId),
      userId: new Types.ObjectId(userId),
    });

    if (!client) {
      throw new AppError('Client not found', 404, 'RESOURCE_NOT_FOUND');
    }

    const clientObjectId = new Types.ObjectId(clientId);

    // Delete associated reminders
    await ScheduledReminder.deleteMany({ clientId: clientObjectId });

    // Delete associated conversations
    await Conversation.deleteMany({ clientId: clientObjectId });

    // Delete client
    await Client.deleteOne({ _id: client._id });

    return { success: true, message: 'Client deleted successfully' };
  }

  /**
   * Create a reminder for a client
   */
  private async createReminder(userId: string, clientId: string, scheduledTime: Date) {
    await ScheduledReminder.create({
      userId: new Types.ObjectId(userId),
      clientId: new Types.ObjectId(clientId),
      scheduledTime,
      status: 'pending',
    });
  }

  /**
   * Cancel all pending reminders for a client
   */
  private async cancelReminder(clientId: string) {
    await ScheduledReminder.updateMany(
      {
        clientId: new Types.ObjectId(clientId),
        status: 'pending',
      },
      { status: 'cancelled' }
    );
  }
}

export const clientService = new ClientService();
