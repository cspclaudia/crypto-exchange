export interface OrderRowAggregated {
  type: "BUY" | "SELL";
  priceUsd: number;
  amountBtc: number;
}

export interface OrderBook {
  bids: OrderRowAggregated[];
  asks: OrderRowAggregated[];
}