import { Request, Response } from "express";
import { ITradeService } from "../services/interfaces/ITradeService";
import { TradeService } from "../services/TradeService";
import { TradeRepository } from "../repositories/TradeRepository";

export class TradeController {
  private tradeService: ITradeService;

  constructor(tradeService?: ITradeService) {
    this.tradeService = tradeService || new TradeService(new TradeRepository());
  }

  getLatestTrades = async (_req: Request, res: Response) => {
    try {
      const trades = await this.tradeService.getLatestTrades();
      return res.status(200).json(trades);
    } catch (err: any) {
      console.error("Error fetching trades:", err);
      return res.status(500).json({ message: "Error fetching trades" });
    }
  };
}
