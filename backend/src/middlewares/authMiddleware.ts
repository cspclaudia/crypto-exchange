import { Request, Response, NextFunction } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { UserType } from "../enums/UserEnum";
import { CONFIG } from "../config/config";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    userType: UserType;
  };
}

interface ExtendedJwtPayload extends jwt.JwtPayload {
  id: number;
  userType: UserType;
}

const JWT_SECRET =
  CONFIG.JWT_SECRET ??
  (() => {
    throw new Error("JWT_SECRET not configured");
  })();

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({
      message: "Token not provided.",
      code: "TOKEN_MISSING",
    });

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token)
    return res.status(401).json({
      message: "Invalid token format.",
      code: "TOKEN_FORMAT_INVALID",
    });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as ExtendedJwtPayload;

    req.user = {
      id: decoded.id,
      userType: decoded.userType,
    };

    return next();
  } catch (err) {
    if (err instanceof TokenExpiredError)
      return res.status(401).json({
        message: "Token expired.",
        code: "TOKEN_EXPIRED",
      });

    return res.status(401).json({
      message: "Invalid token.",
      code: "TOKEN_INVALID",
    });
  }
}
