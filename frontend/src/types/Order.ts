export interface Order {
  id: number;
  type: string;
  amountBtc: number;
  priceUsd: number;
  status: string;
  createdAt: string;
  user?: {
    id: number;
    username: string;
  };
}
