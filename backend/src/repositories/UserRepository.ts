import { Op, Transaction, WhereOptions } from "sequelize";
import { IUserRepository } from "./interfaces/IUserRepository";
import { User, UserCreationAttributes, UserAttributes } from "../models/User";
import { UserType } from "../enums/UserEnum";

export class UserRepository implements IUserRepository {
  async create(user: UserCreationAttributes): Promise<User> {
    return User.create({
      username: user.username,
      password: user.password,
      userType: user.userType ?? UserType.USER,
      usd_available: user.usd_available ?? 100000,
      btc_available: user.btc_available ?? 100,
      usd_locked: 0,
      btc_locked: 0,
    });
  }

  async findById(id: number, transaction?: Transaction): Promise<User | null> {
    return User.findByPk(id, {
      attributes: { exclude: ["password"] },
      transaction,
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return User.findOne({ where: { username } });
  }

  async findAll(): Promise<User[]> {
    return User.findAll({
      attributes: { exclude: ["password"] },
    });
  }

  async updateType(
    userId: number,
    userType: UserType,
    transaction?: Transaction,
  ): Promise<User | null> {
    const user = await User.findByPk(userId, { transaction });
    if (!user) throw new Error("User not found");
    user.userType = userType;
    return user.save({ transaction });
  }

  async adjustBalance(
    userId: number,
    deltaUsd: number,
    deltaBtc: number,
    transaction?: Transaction,
  ): Promise<void> {
    const user = await User.findByPk(userId, { transaction });
    if (!user) throw new Error("User not found");

    await User.increment(
      { usd_available: deltaUsd, btc_available: deltaBtc },
      { where: { id: userId }, transaction },
    );
  }

  async count(): Promise<number> {
    return User.count();
  }
}
