import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes";
import { runMigrations } from "./config/migrator";
import { sequelize } from "./config/database";
import { CONFIG } from "./config/config";
import { connectRedis } from "./config/redis";
import { connectRabbitMQ } from "./config/rabbitmq";

dotenv.config();

const JWT_SECRET = CONFIG.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required!");
}

const app = express();

app.use(
  cors({
    origin: CONFIG.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api", router);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");

    await runMigrations();

    await connectRedis();
    console.log("Redis connected");

    await connectRabbitMQ();
    console.log("RabbitMQ connected");

    const PORT = Number(CONFIG.PORT || 3001);
    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
