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
      status: data.status || 'new',
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
      new: { count: 0, totalAmount: 0 },
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
}

export const orderService = new OrderService();
