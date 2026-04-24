import { UserType } from "../../enums/UserEnum";
import { User } from "../../models/User";

export interface IUserService {
  getAll(): Promise<User[]>;
  updateType(userId: number, userType: UserType): Promise<User | null>;
}
