import { IUserService } from "./interfaces/IUserService";
import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import { User } from "../models/User";
import { UserType } from "../enums/UserEnum";

export class UserService implements IUserService {
  private readonly userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async getAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async updateType(
    userId: number,
    userType: UserType,
  ): Promise<User | null> {
    return this.userRepository.updateType(userId, userType);
  }
}
