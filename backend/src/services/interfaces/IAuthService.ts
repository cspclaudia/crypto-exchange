import { User } from "../../models/User";

export interface IAuthService {
  register(username: string, password: string): Promise<User>;
  login(
    username: string,
    password: string,
  ): Promise<{
    user: Pick<User, "id" | "username" | "userType">;
    accessToken: string;
    refreshToken: string;
  }>;
  refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }>;
  logout(userId: number): Promise<void>;
}
