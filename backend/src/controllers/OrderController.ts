import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { OrderService } from "../services/OrderService";
import { OrderRepository } from "../repositories/OrderRepository";
import { OrderType } from "../enums/OrderEnums";

export class OrderController {
  private orderService = new OrderService(new OrderRepository());

  private checkAuth(user: AuthRequest["user"], res: Response) {
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return false;
    }

    return true;
  }

  buy = async (req: AuthRequest, res: Response) => {
    try {
      if (!this.checkAuth(req.user, res)) return;

      const { amountBtc, priceUsd } = req.body;

      if (
        !amountBtc ||
        !priceUsd ||
        Number(amountBtc) <= 0 ||
        Number(priceUsd) <= 0
      ) {
        return res.status(400).json({ message: "Invalid parameters" });
      }

      const order = await this.orderService.create(
        req.user!.id,
        OrderType.BUY,
        Number(amountBtc),
        Number(priceUsd),
      );

      res.status(201).json(order);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  sell = async (req: AuthRequest, res: Response) => {
    try {
      if (!this.checkAuth(req.user, res)) return;

      const { amountBtc, priceUsd } = req.body;
      if (
        !amountBtc ||
        !priceUsd ||
        Number(amountBtc) <= 0 ||
        Number(priceUsd) <= 0
      ) {
        return res.status(400).json({ message: "Invalid parameters" });
      }

      const order = await this.orderService.create(
        req.user!.id,
        OrderType.SELL,
        Number(amountBtc),
        Number(priceUsd),
      );

      res.status(201).json(order);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  cancel = async (req: AuthRequest, res: Response) => {
    try {
      if (!this.checkAuth(req.user, res)) return;

      const orderId = Number(req.params.id);

      if (isNaN(orderId) || orderId <= 0)
        return res.status(400).json({ message: "Invalid order ID" });

      await this.orderService.cancel(orderId, req.user!.id);

      res.status(200).json({ message: "Order canceled successfully" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  getOrderBook = async (req: AuthRequest, res: Response) => {
    try {
      if (!this.checkAuth(req.user, res)) return;

      const orders = await this.orderService.getOrderBookAggregated(
        req.user!.id,
      );
      
      res.json(orders);
    } catch (err: any) {
      console.error("Error fetching order book:", err);
      res.status(500).json({ message: err.message });
    }
  };

  getUserActive = async (req: AuthRequest, res: Response) => {
    try {
      if (!this.checkAuth(req.user, res)) return;

      const orders = await this.orderService.getUserActive(req.user!.id);

      res.json(orders);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  getUserHistory = async (req: AuthRequest, res: Response) => {
    try {
      if (!this.checkAuth(req.user, res)) return;

      const orders = await this.orderService.getUserHistory(req.user!.id);

      res.json(orders);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };
}
