import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";
import { UserType } from "../enums/UserEnum";

export async function adminMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) return res.status(401).json({ message: "Not authenticated." });

  if (req.user.userType !== UserType.ADMIN)
    return res
      .status(403)
      .json({ message: "Access restricted to administrators." });

  next();
}
