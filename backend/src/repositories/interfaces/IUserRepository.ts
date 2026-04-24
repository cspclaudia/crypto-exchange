import { Transaction } from "sequelize";
import {
  User,
  UserCreationAttributes,
} from "../../models/User";
import { UserType } from "../../enums/UserEnum";

export interface IUserRepository {
  create(user: UserCreationAttributes): Promise<User>;
  findById(id: number, transaction?: Transaction): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  updateType(
    userId: number,
    userType: UserType,
    transaction?: Transaction,
  ): Promise<User | null>;
  adjustBalance(
    userId: number,
    deltaUsd: number,
    deltaBtc: number,
    transaction?: Transaction,
  ): Promise<void>;
  count(): Promise<number>;
}
