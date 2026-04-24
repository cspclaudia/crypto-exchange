import { Op, Transaction } from "sequelize";
import { Trade, TradeCreationAttributes } from "../models/Trade";
import { ITradeRepository } from "./interfaces/ITradeRepository";
import { Order } from "../models/Order";
import User from "../models/User";

export class TradeRepository implements ITradeRepository {
  async create(
    trade: TradeCreationAttributes,
    transaction?: Transaction,
  ): Promise<Trade> {
    return Trade.create(trade, { transaction });
  }

  private getOrderInclude() {
    return {
      model: Order,
      required: false,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username"],
          required: false,
        },
      ],
    };
  }

  async findLatestTrades(transaction?: Transaction): Promise<Trade[]> {
    return Trade.findAll({
      order: [["createdAt", "DESC"]],
      transaction,
      include: [
        { ...this.getOrderInclude(), as: "buyOrder" },
        { ...this.getOrderInclude(), as: "sellOrder" },
      ],
    });
  }

  async findByUser(
    userId: number,
    transaction?: Transaction,
  ): Promise<Trade[]> {
    return Trade.findAll({
      where: {
        [Op.or]: [{ buyUserId: userId }, { sellUserId: userId }],
      },
      order: [["createdAt", "DESC"]],
      transaction,
      include: [
        {
          model: Order,
          as: "buyOrder",
          required: false,
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "username"],
              required: false,
            },
          ],
        },
        {
          model: Order,
          as: "sellOrder",
          required: false,
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "username"],
              required: false,
            },
          ],
        },
      ],
    });
  }
}
