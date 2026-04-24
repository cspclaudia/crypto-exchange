import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { UserRepository } from "../repositories/UserRepository";
import { SessionService } from "../services/SessionService";
import { AuthRequest } from "../middlewares/authMiddleware";

export class AuthController {
  private authService: AuthService;

  constructor() {
    const userRepository = new UserRepository();
    const sessionService = new SessionService();
    this.authService = new AuthService(userRepository, sessionService);
  }

  register = async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password)
        return res
          .status(400)
          .json({ message: "Username and password are required." });

      if (password.length < 8)
        return res
          .status(400)
          .json({ message: "Password must be at least 8 characters long." });

      try {
        const user = await this.authService.register(username, password);

        const { accessToken, refreshToken } = await this.authService.login(
          username,
          password,
        );

        const safeUser = {
          id: user.id,
          username: user.username,
          userType: user.userType,
        };

        return res
          .status(201)
          .json({ user: safeUser, accessToken, refreshToken });
      } catch (err: any) {
        throw err;
      }
    } catch (err: any) {
      return res.status(400).json({
        message: err.message || "Error registering user.",
      });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password)
        return res
          .status(400)
          .json({ message: "Username and password are required." });

      const { user, accessToken, refreshToken } = await this.authService.login(
        username,
        password,
      );

      const safeUser = {
        id: user.id,
        username: user.username,
        userType: user.userType,
      };

      return res
        .status(200)
        .json({ user: safeUser, accessToken, refreshToken });
    } catch (err: any) {
      return res
        .status(400)
        .json({ message: err.message || "Error authenticating." });
    }
  };

  refreshToken = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken)
        return res.status(400).json({ message: "Refresh token is required." });

      const { accessToken, refreshToken: newRefreshToken } =
        await this.authService.refreshToken(refreshToken);

      return res.status(200).json({
        accessToken,
        refreshToken: newRefreshToken,
      });
    } catch (err: any) {
      return res
        .status(401)
        .json({ message: err.message || "Invalid refresh token." });
    }
  };

  logout = async (req: AuthRequest, res: Response) => {
    try {
      const id = req.user?.id;

      if (!id) return res.status(401).json({ message: "Unauthorized." });

      await this.authService.logout(id);

      return res.status(200).json({ message: "Logout successful." });
    } catch (err: any) {
      return res.status(500).json({ message: "Error logging out." });
    }
  };
}
