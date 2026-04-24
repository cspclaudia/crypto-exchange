import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { CONFIG } from "../config/config";

interface TokenPayload {
  userId: number;
  userType: string;
}

export function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void,
) {
  const token = socket.handshake.auth.token;

  if (!token) return next(new Error("Token missing"));

  try {
    const decoded = jwt.verify(token, CONFIG.JWT_SECRET!) as unknown;

    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "userId" in decoded &&
      "userType" in decoded
    ) {
      const payload: TokenPayload = {
        userId: (decoded as any).userId,
        userType: (decoded as any).userType,
      };

      socket.data.user = payload;
      return next();
    }

    return next(new Error("Invalid token payload"));
  } catch (err) {
    console.error("Invalid token in Socket.IO:", err);
    return next(new Error("Invalid token"));
  }
}
