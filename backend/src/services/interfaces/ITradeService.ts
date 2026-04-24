import { Trade } from "../../models/Trade";

export interface ITradeService {
  getLatestTrades(): Promise<Trade[]>;
}
