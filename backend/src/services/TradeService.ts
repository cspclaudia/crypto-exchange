import { ITradeService } from "./interfaces/ITradeService";
import { Trade } from "../models/Trade";
import { ITradeRepository } from "../repositories/interfaces/ITradeRepository";

export class TradeService implements ITradeService {
  private readonly tradeRepository: ITradeRepository;

  constructor(tradeRepository: ITradeRepository) {
    this.tradeRepository = tradeRepository;
  }

  async getLatestTrades(): Promise<Trade[]> {
    return this.tradeRepository.findLatestTrades();
  }
}
