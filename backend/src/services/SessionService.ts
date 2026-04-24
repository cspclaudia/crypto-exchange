import { ISessionService } from "./interfaces/ISessionService";
import { redis } from "../config/redis";

export class SessionService implements ISessionService {
  async saveRefreshToken(
    userId: number,
    token: string,
    ttlSeconds: number,
  ): Promise<void> {
    await redis.set(`refreshToken:${userId}`, token, { EX: ttlSeconds });
  }

  async getRefreshToken(userId: number): Promise<string | null> {
    return await redis.get(`refreshToken:${userId}`);
  }

  async deleteRefreshToken(userId: number): Promise<void> {
    await redis.del(`refreshToken:${userId}`);
  }
}
