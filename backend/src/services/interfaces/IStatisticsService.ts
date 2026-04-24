export interface Statistics {
  lastPrice: number | null;
  volumeBtc24h: number;
  volumeUsd24h: number;
  high24h: number | null;
  low24h: number | null;
  userUsdBalance: number;
  userBtcBalance: number;
}

export interface IStatisticsService {
  getStatisticsForUser(userId: number): Promise<Statistics>;
}
