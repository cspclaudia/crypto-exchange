import { Op, Transaction, FindOptions, fn, col } from "sequelize";
import { IOrderRepository } from "./interfaces/IOrderRepository";
import { Order, OrderCreationAttributes } from "../models/Order";
import { OrderStatus } from "../enums/OrderEnums";
import User from "../models/User";
import { OrderRowAggregated } from "../types/OrderBook";

export class OrderRepository implements IOrderRepository {
  async create(
    data: OrderCreationAttributes,
    options?: { transaction?: Transaction },
  ): Promise<Order> {
    return Order.create(data, options);
  }

  async updateStatus(
    orderId: number,
    status: OrderStatus,
    options?: { transaction?: Transaction },
  ): Promise<void> {
    await Order.update(
      { status },
      {
        where: { id: orderId },
        ...options,
      },
    );
  }

  async findById(
    orderId: number,
    options?: { transaction?: Transaction },
  ): Promise<Order | null> {
    return Order.findByPk(orderId, options);
  }

  async findByUserAndStatus(
    userId: number,
    status: OrderStatus,
  ): Promise<Order[]> {
    return Order.findAll({
      where: { userId, status },
      order: [["updatedAt", "DESC"]],
    });
  }

  async findByUser(userId: number): Promise<Order[]> {
    return Order.findAll({
      where: { userId },
      order: [["updatedAt", "DESC"]],
    });
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    return Order.findAll({
      where: { status },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username"],
        },
      ],
      order: [["updatedAt", "DESC"]],
    });
  }

  async findLastTrade(): Promise<Order | null> {
    return Order.findOne({
      where: { status: OrderStatus.TRADED },
      order: [["updatedAt", "DESC"]],
    });
  }

  async findAllTrades(): Promise<Order[]> {
    return Order.findAll({
      where: { status: OrderStatus.TRADED },
      order: [["updatedAt", "DESC"]],
    });
  }

  async findOrderBookAggregated(userId: number): Promise<OrderRowAggregated[]> {
    const rows = await Order.findAll({
      attributes: [
        "type",
        "priceUsd",
        [fn("SUM", col("amountBtc")), "amountBtc"],
      ],
      where: {
        status: OrderStatus.OPEN,
        userId: {
          [Op.ne]: userId,
        },
      },
      group: ["type", "priceUsd"],
      raw: true,
    });

    return rows as OrderRowAggregated[];
  }
}
