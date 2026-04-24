import { Order } from "../../models/Order";
import { OrderStatus } from "../../enums/OrderEnums";
import { Transaction } from "sequelize";
import { OrderRowAggregated } from "../../types/OrderBook";

export interface IOrderRepository {
  create(
    order: Partial<Order>,
    options?: { transaction?: Transaction },
  ): Promise<Order>;
  findById(
    orderId: number,
    options?: { transaction?: Transaction },
  ): Promise<Order | null>;
  updateStatus(
    orderId: number,
    status: OrderStatus,
    options?: { transaction?: Transaction },
  ): Promise<void>;
  findByUserAndStatus(userId: number, status: OrderStatus): Promise<Order[]>;
  findByUser(userId: number): Promise<Order[]>;
  findByStatus(
    status: OrderStatus,
    options?: { excludeUserId?: number },
  ): Promise<Order[]>;
  findLastTrade(): Promise<Order | null>;
  findAllTrades(): Promise<Order[]>;
  findOrderBookAggregated(userId: number): Promise<OrderRowAggregated[]>;
}
