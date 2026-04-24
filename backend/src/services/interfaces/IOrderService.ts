import { Order } from "../../models/Order";
import { OrderType } from "../../enums/OrderEnums";
import { OrderBook } from "../../types/OrderBook";

export interface IOrderService {
  create(
    userId: number,
    type: OrderType,
    amountBtc: number,
    priceUsd: number,
  ): Promise<Order>;
  cancel(orderId: number, userId: number): Promise<void>;
  getOrderBookAggregated(userId: number): Promise<OrderBook>;
  getOrderById(orderId: number): Promise<Order | null>;
  getUserHistory(userId: number): Promise<Order[]>;
}
