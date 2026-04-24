import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IAuthService } from "./interfaces/IAuthService";
import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import { ISessionService } from "./interfaces/ISessionService";
import { User } from "../models/User";
import { UserType } from "../enums/UserEnum";
import { CONFIG } from "../config/config";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthService implements IAuthService {
  private readonly userRepository: IUserRepository;
  private readonly sessionService: ISessionService;
  private readonly jwtSecret: string;
  private readonly refreshSecret: string;

  constructor(
    userRepository: IUserRepository,
    sessionService: ISessionService,
  ) {
    this.userRepository = userRepository;
    this.sessionService = sessionService;

    if (!CONFIG.JWT_SECRET) throw new Error("JWT_SECRET is not defined.");

    if (!CONFIG.REFRESH_SECRET)
      throw new Error("REFRESH_SECRET is not defined.");

    this.jwtSecret = CONFIG.JWT_SECRET;
    this.refreshSecret = CONFIG.REFRESH_SECRET;
  }

  async register(username: string, password: string): Promise<User> {
    const existingUser = await this.userRepository.findByUsername(username);
    if (existingUser) throw new ValidationError("Username is already taken.");

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password))
      throw new ValidationError(
        "Password must contain uppercase, lowercase, number and special character.",
      );

    const isFirstUser = (await this.userRepository.count()) === 0;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.userRepository.create({
      username,
      password: hashedPassword,
      userType: isFirstUser ? UserType.ADMIN : UserType.USER,
      usd_available: 100000,
      btc_available: 100,
      usd_locked: 0,
      btc_locked: 0,
    });

    return newUser;
  }

  async login(
    username: string,
    password: string,
  ): Promise<{
    user: Pick<User, "id" | "username" | "userType">;
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) throw new AuthenticationError("Invalid username or password.");

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches)
      throw new AuthenticationError("Invalid username or password.");

    const safeUser = {
      id: user.id,
      username: user.username,
      userType: user.userType,
    };

    const accessToken = jwt.sign(
      { id: user.id, userType: user.userType },
      this.jwtSecret,
      { expiresIn: "30m" },
    );

    const refreshToken = jwt.sign({ id: user.id }, this.refreshSecret, {
      expiresIn: "1d",
    });

    const hashedRefresh = await bcrypt.hash(refreshToken, 10);

    await this.sessionService.saveRefreshToken(
      user.id,
      hashedRefresh,
      24 * 3600,
    );

    return { user: safeUser, accessToken, refreshToken };
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, this.refreshSecret) as {
        id: number;
      };

      const savedToken = await this.sessionService.getRefreshToken(decoded.id);
      if (!savedToken) throw new AuthenticationError("Invalid refresh token.");

      const matches = await bcrypt.compare(refreshToken, savedToken);
      if (!matches) throw new AuthenticationError("Invalid refresh token.");

      const user = await this.userRepository.findById(decoded.id);
      if (!user) throw new AuthenticationError("User not found.");

      const newRefreshToken = jwt.sign({ id: user.id }, this.refreshSecret, {
        expiresIn: "1d",
      });
      const hashedNewRefresh = await bcrypt.hash(newRefreshToken, 10);

      await this.sessionService.saveRefreshToken(
        user.id,
        hashedNewRefresh,
        24 * 3600,
      );

      const accessToken = jwt.sign(
        { id: user.id, userType: user.userType },
        this.jwtSecret,
        { expiresIn: "30m" },
      );

      return { accessToken, refreshToken: newRefreshToken };
    } catch {
      throw new AuthenticationError("Invalid or expired refresh token.");
    }
  }

  async logout(userId: number): Promise<void> {
    await this.sessionService.deleteRefreshToken(userId);
  }
}
