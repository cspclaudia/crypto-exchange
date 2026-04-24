import dotenv from "dotenv";
dotenv.config();

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const CONFIG = {
  PORT: Number(getEnv("PORT", "3001")),

  JWT_SECRET: getEnv("JWT_SECRET"),
  REFRESH_SECRET: getEnv("REFRESH_SECRET"),

  DB_HOST: getEnv("DB_HOST"),
  DB_USER: getEnv("DB_USER"),
  DB_PASSWORD: getEnv("DB_PASSWORD"),
  DB_NAME: getEnv("DB_NAME"),
  DB_PORT: Number(getEnv("DB_PORT", "3306")),

  REDIS_URL: getEnv("REDIS_URL", "redis://localhost:6379"),
  RABBITMQ_URL: getEnv("RABBITMQ_URL"),

  FRONTEND_URL: getEnv("FRONTEND_URL", "http://localhost:3000"),
};
