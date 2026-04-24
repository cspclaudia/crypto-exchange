import { Trade, TradeCreationAttributes } from "../../models/Trade";
import { Transaction } from "sequelize";

export interface ITradeRepository {
  create(
    trade: TradeCreationAttributes,
    transaction?: Transaction,
  ): Promise<Trade>;
  findLatestTrades(transaction?: Transaction): Promise<Trade[]>;
  findByUser(userId: number, transaction?: Transaction): Promise<Trade[]>;
}
