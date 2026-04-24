import { createClient } from "redis";
import { CONFIG } from "./config";

export const redis = createClient({ url: CONFIG.REDIS_URL });

redis.on("error", (err) => console.error("Redis Client Error", err));

export async function connectRedis() {
  if (!redis.isOpen) {
    await redis.connect();
    console.log("Redis connected");
  }
}
