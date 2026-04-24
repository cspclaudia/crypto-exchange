export interface ISessionService {
  saveRefreshToken(
    userId: number,
    token: string,
    ttlSeconds?: number,
  ): Promise<void>;
  getRefreshToken(userId: number): Promise<string | null>;
  deleteRefreshToken(userId: number): Promise<void>;
}
