import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { UserService } from "../services/UserService";
import { UserRepository } from "../repositories/UserRepository";
import { UserType } from "../enums/UserEnum";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService(new UserRepository());
  }

  listAll = async (req: AuthRequest, res: Response) => {
    try {
      const users = await this.userService.getAll();

      const safeUsers = users.map((user) => ({
        id: user.id,
        username: user.username,
        userType: user.userType,
      }));

      return res.json(safeUsers);
    } catch (err: any) {
      return res
        .status(500)
        .json({ message: err.message || "Internal error." });
    }
  };

  updateType = async (req: AuthRequest, res: Response) => {
    try {
      const userId = Number(req.params.id);
      const { userType } = req.body;

      if (!userId) return res.status(400).json({ message: "Invalid user id" });

      if (!Object.values(UserType).includes(userType))
        return res.status(400).json({ message: "Invalid user type" });

      const user = await this.userService.updateType(userId, userType);

      const safeUser = {
        id: user?.id,
        username: user?.username,
        userType: user?.userType,
      };

      return res.json(safeUser);
    } catch (err: any) {
      return res
        .status(400)
        .json({ message: err.message || "Failed to update user type" });
    }
  };
}
