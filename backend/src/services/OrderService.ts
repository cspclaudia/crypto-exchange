import { IOrderService } from "./interfaces/IOrderService";
import { IOrderRepository } from "../repositories/interfaces/IOrderRepository";
import { Order } from "../models/Order";
import { OrderType, OrderStatus } from "../enums/OrderEnums";
import { addOrderToQueue } from "../queue/orderQueue";
import User from "../models/User";
import { sequelize } from "../config/database";
import { OrderBook, OrderRowAggregated } from "../types/OrderBook";

export class OrderService implements IOrderService {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async create(
    userId: number,
    type: OrderType,
    amountBtc: number,
    priceUsd: number,
  ): Promise<Order> {
    return await sequelize.transaction(async (transaction) => {
      const user = await User.findByPk(userId, { transaction, lock: true });

      if (!user) throw new Error("User not found");

      const totalUsd = amountBtc * priceUsd;

      if (type === OrderType.BUY) {
        if (Number(user.usd_available) < totalUsd)
          throw new Error("Insufficient USD balance");

        await user.update(
          {
            usd_available: Number(user.usd_available) - totalUsd,
            usd_locked: Number(user.usd_locked) + totalUsd,
          },
          { transaction },
        );
      } else {
        if (Number(user.btc_available) < amountBtc)
          throw new Error("Insufficient BTC balance");

        await user.update(
          {
            btc_available: Number(user.btc_available) - amountBtc,
            btc_locked: Number(user.btc_locked) + amountBtc,
          },
          { transaction },
        );
      }

      const order = await this.orderRepository.create(
        {
          userId,
          type,
          amountBtc,
          priceUsd,
          status: OrderStatus.OPEN,
        },
        { transaction },
      );

      await addOrderToQueue(order.id);

      return order;
    });
  }

  async cancel(orderId: number, userId: number): Promise<void> {
    await sequelize.transaction(async (transaction) => {

      const order = await Order.findByPk(orderId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!order) throw new Error("Order not found");

      if (order.status !== OrderStatus.OPEN)
        throw new Error("Order is not open");

      if (order.userId !== userId) throw new Error("Unauthorized");

      const user = await User.findByPk(userId, {
        transaction,
        lock: true,
      });

      if (!user) throw new Error("User not found");

      const totalUsd = Number(order.amountBtc) * Number(order.priceUsd);

      if (order.type === OrderType.BUY) {
        await user.update(
          {
            usd_available: Number(user.usd_available) + totalUsd,
            usd_locked: Number(user.usd_locked) - totalUsd,
          },
          { transaction },
        );
      } else {
        await user.update(
          {
            btc_available: Number(user.btc_available) + Number(order.amountBtc),
            btc_locked: Number(user.btc_locked) - Number(order.amountBtc),
          },
          { transaction },
        );
      }

      await this.orderRepository.updateStatus(orderId, OrderStatus.CANCELED, {
        transaction,
      });
    });
  }

  async getOrderBookAggregated(userId: number): Promise<OrderBook> {
    const rows = await this.orderRepository.findOrderBookAggregated(userId);

    const normalized: OrderRowAggregated[] = rows.map((row) => ({
      type: row.type,
      priceUsd: Number(row.priceUsd),
      amountBtc: Number(row.amountBtc),
    }));

    const bids = normalized
      .filter((o) => o.type === "BUY")
      .sort((a, b) => b.priceUsd - a.priceUsd);

    const asks = normalized
      .filter((o) => o.type === "SELL")
      .sort((a, b) => a.priceUsd - b.priceUsd);

    return {
      bids,
      asks,
    };
  }

  async getOrderById(orderId: number): Promise<Order | null> {
    return this.orderRepository.findById(orderId);
  }

  async getUserActive(userId: number): Promise<Order[]> {
    return this.orderRepository.findByUserAndStatus(userId, OrderStatus.OPEN);
  }

  async getUserHistory(userId: number): Promise<Order[]> {
    return this.orderRepository.findByUser(userId);
  }

  private async getOpenOrder(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) throw new Error("Order not found");

    if (order.status !== OrderStatus.OPEN) throw new Error("Order is not open");

    return order;
  }
}
