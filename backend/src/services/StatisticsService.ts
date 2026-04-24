import {
  IStatisticsService,
  Statistics,
} from "./interfaces/IStatisticsService";
import { IOrderRepository } from "../repositories/interfaces/IOrderRepository";
import { IUserRepository } from "../repositories/interfaces/IUserRepository";

export class StatisticsService implements IStatisticsService {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async getStatisticsForUser(userId: number): Promise<Statistics> {
    const user = await this.userRepository.findById(userId);

    if (!user) throw new Error("User not found");

    const lastTrade = await this.orderRepository.findLastTrade();
    const lastPrice = lastTrade?.priceUsd ?? null;

    const trades = await this.orderRepository.findAllTrades();

    const volumeBtc24h = trades.reduce(
      (sum, trade) => sum + Number(trade.amountBtc),
      0,
    );
    const volumeUsd24h = trades.reduce(
      (sum, trade) => sum + Number(trade.amountBtc) * Number(trade.priceUsd),
      0,
    );

    const prices = trades.map((trade) => Number(trade.priceUsd));
    const high24h = prices.length > 0 ? Math.max(...prices) : null;
    const low24h = prices.length > 0 ? Math.min(...prices) : null;

    return {
      lastPrice,
      volumeBtc24h,
      volumeUsd24h,
      high24h,
      low24h,
      userUsdBalance: Number(user.usd_available),
      userBtcBalance: Number(user.btc_available),
    };
  }
}
