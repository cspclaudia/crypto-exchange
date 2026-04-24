import { Order } from "./Order";

export interface OrderBook {
  bids: Order[];
  asks: Order[];
}
