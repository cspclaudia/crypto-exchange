import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { StatisticsService } from "../services/StatisticsService";
import { OrderRepository } from "../repositories/OrderRepository";
import { UserRepository } from "../repositories/UserRepository";

export class StatisticsController {
  private statisticsService: StatisticsService;

  constructor() {
    this.statisticsService = new StatisticsService(
      new OrderRepository(),
      new UserRepository(),
    );
  }

  getStatistics = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      const userId = req.user.id;

      if (!userId || userId <= 0)
        return res.status(400).json({ message: "Invalid user ID" });

      const statistics =
        await this.statisticsService.getStatisticsForUser(userId);

      return res.status(200).json(statistics);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error retrieving statistics";
      return res.status(500).json({ message });
    }
  };
}
