import mongoose from 'mongoose';
import { Order } from '../models';
import { Client } from '../models';
import { AppError } from '../middleware/error.middleware';
import { CreateOrderRequest, UpdateOrderRequest, GetOrdersQuery, OrderStatus } from '../types';

export class OrderService {
  /**
   * Create a new order
   */
  async createOrder(userId: string, data: CreateOrderRequest) {
    // Verify client exists and belongs to user
    const client = await Client.findOne({
      _id: data.clientId,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!client) {
      throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND');
    }

    const order = new Order({
      userId: new mongoose.Types.ObjectId(userId),
      clientId: new mongoose.Types.ObjectId(data.clientId),
      title: data.title,
      description: data.description,
      amount: data.amount,
      status: 'in_progress', // Loyiha yaratilganda avtomatik jarayonda
      milestones: data.milestones || [],
      totalPaid: 0,
    });

    await order.save();
    return order.toObject();
  }

  /**
   * Get orders for a user with filters
   */
  async getOrders(userId: string, query: GetOrdersQuery) {
    const {
      status,
      clientId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = query;

    const filter: Record<string, unknown> = {
      userId: new mongoose.Types.ObjectId(userId),
    };

    if (status) {
      filter.status = status;
    }

    if (clientId) {
      filter.clientId = new mongoose.Types.ObjectId(clientId);
    }

    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('clientId', 'fullName companyName phoneNumber')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return {
      orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single order by ID
   */
  async getOrderById(userId: string, orderId: string) {
    const order = await Order.findOne({
      _id: orderId,
      userId: new mongoose.Types.ObjectId(userId),
    })
      .populate('clientId', 'fullName companyName phoneNumber location')
      .populate('team.developerId', 'firstName lastName username')
      .populate('teamLeadId', 'firstName lastName username')
      .lean();

    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    return order;
  }

  /**
   * Update order
   */
  async updateOrder(userId: string, orderId: string, data: UpdateOrderRequest) {
    const order = await Order.findOneAndUpdate(
      {
        _id: orderId,
        userId: new mongoose.Types.ObjectId(userId),
      },
      { $set: data },
      { new: true, runValidators: true }
    )
      .populate('clientId', 'fullName companyName phoneNumber')
      .lean();

    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    return order;
  }

  /**
   * Delete order
   */
  async deleteOrder(userId: string, orderId: string) {
    const order = await Order.findOneAndDelete({
      _id: orderId,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    return { deleted: true };
  }

  /**
   * Get order statistics for user
   */
  async getOrderStats(userId: string) {
    const stats = await Order.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: { $ifNull: ['$amount', 0] } },
        },
      },
    ]);

    const result: Record<OrderStatus, { count: number; totalAmount: number }> = {
      in_progress: { count: 0, totalAmount: 0 },
      completed: { count: 0, totalAmount: 0 },
    };

    stats.forEach((stat) => {
      if (stat._id in result) {
        result[stat._id as OrderStatus] = {
          count: stat.count,
          totalAmount: stat.totalAmount,
        };
      }
    });

    return result;
  }

  /**
   * Get all orders (Admin only)
   */
  async getAllOrders(query: GetOrdersQuery & { userId?: string }) {
    const {
      status,
      clientId,
      userId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = query;

    const filter: Record<string, unknown> = {};

    if (status) filter.status = status;
    if (clientId) filter.clientId = new mongoose.Types.ObjectId(clientId);
    if (userId) filter.userId = new mongoose.Types.ObjectId(userId);

    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('userId', 'firstName lastName username')
        .populate('clientId', 'fullName companyName phoneNumber')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return {
      orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update milestone status
   */
  async updateMilestoneStatus(
    userId: string,
    orderId: string,
    milestoneId: string,
    status: 'pending' | 'in_progress' | 'completed' | 'paid'
  ) {
    const order = await Order.findOne({
      _id: orderId,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    const milestone = order.milestones?.find(
      (m) => m._id?.toString() === milestoneId
    );

    if (!milestone) {
      throw new AppError('Milestone not found', 404, 'MILESTONE_NOT_FOUND');
    }

    milestone.status = status;
    
    if (status === 'completed') {
      milestone.completedAt = new Date();
    } else if (status === 'paid') {
      milestone.paidAt = new Date();
      // Update totalPaid
      const totalPaid = order.milestones
        ?.filter((m) => m.status === 'paid')
        .reduce((sum, m) => sum + m.amount, 0) || 0;
      order.totalPaid = totalPaid + milestone.amount;
    }

    // Update order progress based on milestones
    if (order.milestones && order.milestones.length > 0) {
      const completedOrPaid = order.milestones.filter(
        (m) => m.status === 'completed' || m.status === 'paid'
      ).length;
      order.progress = Math.round((completedOrPaid / order.milestones.length) * 100);
    }

    await order.save();
    return order.toObject();
  }

  /**
   * Update milestone details (title, amount, percentage, dueDate, tasks)
   */
  async updateMilestone(
    userId: string,
    orderId: string,
    milestoneId: string,
    data: {
      title?: string;
      description?: string;
      amount?: number;
      percentage?: number;
      dueDate?: string | null;
      tasks?: string[];
    }
  ) {
    const order = await Order.findOne({
      _id: orderId,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    const milestone = order.milestones?.find(
      (m) => m._id?.toString() === milestoneId
    );

    if (!milestone) {
      throw new AppError('Milestone not found', 404, 'MILESTONE_NOT_FOUND');
    }

    // Update fields
    if (data.title) milestone.title = data.title;
    if (data.description !== undefined) milestone.description = data.description;
    if (data.amount !== undefined) milestone.amount = data.amount;
    if (data.percentage !== undefined) milestone.percentage = data.percentage;
    if (data.dueDate !== undefined) {
      milestone.dueDate = data.dueDate ? new Date(data.dueDate) : undefined;
    }
    if (data.tasks !== undefined) milestone.tasks = data.tasks;

    await order.save();
    return order.toObject();
  }

  /**
   * Delete milestone
   */
  async deleteMilestone(userId: string, orderId: string, milestoneId: string) {
    const order = await Order.findOne({
      _id: orderId,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    order.milestones = order.milestones?.filter(
      (m) => m._id?.toString() !== milestoneId
    );

    await order.save();
    return order.toObject();
  }

  /**
   * Get order with milestones for developer view
   */
  async getOrderForDeveloper(orderId: string) {
    const order = await Order.findById(orderId)
      .populate('clientId', 'fullName companyName phoneNumber')
      .populate('userId', 'firstName lastName username')
      .populate('team.developerId', 'firstName lastName username')
      .populate('teamLeadId', 'firstName lastName username')
      .lean();

    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    return order;
  }

  /**
   * Add developer to project team
   */
  async addTeamMember(userId: string, orderId: string, developerId: string, role: 'developer' | 'team_lead' = 'developer') {
    const order = await Order.findOne({
      _id: orderId,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    // Check if developer already in team
    const existingMember = order.team?.find(
      (m) => m.developerId.toString() === developerId
    );

    if (existingMember) {
      throw new AppError('Developer already in team', 400, 'ALREADY_IN_TEAM');
    }

    // Initialize team array if not exists
    if (!order.team) {
      order.team = [];
    }

    // Add new team member
    order.team.push({
      developerId: new mongoose.Types.ObjectId(developerId),
      role,
      joinedAt: new Date(),
    });

    // If role is team_lead, update teamLeadId
    if (role === 'team_lead') {
      order.teamLeadId = new mongoose.Types.ObjectId(developerId);
    }

    await order.save();
    
    // Return populated order
    return Order.findById(orderId)
      .populate('team.developerId', 'firstName lastName username')
      .populate('teamLeadId', 'firstName lastName username')
      .lean();
  }

  /**
   * Remove developer from project team
   */
  async removeTeamMember(userId: string, orderId: string, developerId: string) {
    const order = await Order.findOne({
      _id: orderId,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    // Remove from team
    order.team = order.team?.filter(
      (m) => m.developerId.toString() !== developerId
    );

    // If removed developer was team lead, clear teamLeadId
    if (order.teamLeadId?.toString() === developerId) {
      order.teamLeadId = undefined;
    }

    await order.save();
    
    return Order.findById(orderId)
      .populate('team.developerId', 'firstName lastName username')
      .populate('teamLeadId', 'firstName lastName username')
      .lean();
  }

  /**
   * Set team lead for project
   */
  async setTeamLead(userId: string, orderId: string, developerId: string) {
    const order = await Order.findOne({
      _id: orderId,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    // Check if developer is in team
    const member = order.team?.find(
      (m) => m.developerId.toString() === developerId
    );

    if (!member) {
      throw new AppError('Developer not in team', 400, 'NOT_IN_TEAM');
    }

    // Update previous team lead role to developer
    if (order.teamLeadId) {
      const prevLead = order.team?.find(
        (m) => m.developerId.toString() === order.teamLeadId?.toString()
      );
      if (prevLead) {
        prevLead.role = 'developer';
      }
    }

    // Set new team lead
    member.role = 'team_lead';
    order.teamLeadId = new mongoose.Types.ObjectId(developerId);

    await order.save();
    
    return Order.findById(orderId)
      .populate('team.developerId', 'firstName lastName username')
      .populate('teamLeadId', 'firstName lastName username')
      .lean();
  }

  /**
   * Get project team
   */
  async getTeam(orderId: string) {
    const order = await Order.findById(orderId)
      .populate('team.developerId', 'firstName lastName username phoneNumber')
      .populate('teamLeadId', 'firstName lastName username phoneNumber')
      .lean();

    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    return {
      team: order.team || [],
      teamLead: order.teamLeadId,
    };
  }
}

export const orderService = new OrderService();
