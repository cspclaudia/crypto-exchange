export interface OrderRowAggregated {
  type: "BUY" | "SELL";
  priceUsd: number;
  amountBtc: number;
}