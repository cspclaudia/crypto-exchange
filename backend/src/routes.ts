import { Router } from "express";
import { AuthController } from "./controllers/AuthController";
import { UserController } from "./controllers/UserController";
import { OrderController } from "./controllers/OrderController";
import { StatisticsController } from "./controllers/StatisticsController";
import { TradeController } from "./controllers/TradeController";

import { authMiddleware } from "./middlewares/authMiddleware";
import { adminMiddleware } from "./middlewares/adminMiddleware";

const router = Router();

const authController = new AuthController();
const userController = new UserController();
const orderController = new OrderController();
const statisticsController = new StatisticsController();
const tradeController = new TradeController();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authMiddleware, authController.logout);

router.get("/users", authMiddleware, adminMiddleware, userController.listAll);
router.patch("/users/:id/update-type", authMiddleware, adminMiddleware, userController.updateType);

router.get("/statistics", authMiddleware, statisticsController.getStatistics);
router.get("/trades", authMiddleware, tradeController.getLatestTrades);

router.post("/orders/buy", authMiddleware, orderController.buy);
router.post("/orders/sell", authMiddleware, orderController.sell);
router.patch("/orders/:id/cancel", authMiddleware, orderController.cancel);

router.get("/orders/bid-ask", authMiddleware, orderController.getOrderBook);
router.get("/orders/active", authMiddleware, orderController.getUserActive);
router.get("/orders/history", authMiddleware, orderController.getUserHistory);

export default router;