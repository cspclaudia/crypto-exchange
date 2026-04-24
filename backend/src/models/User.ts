import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { UserType } from "../enums/UserEnum";

export interface UserAttributes {
  id: number;
  username: string;
  password: string;
  userType: UserType;
  btc_available: number;
  btc_locked: number;
  usd_available: number;
  usd_locked: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes extends Optional<
  UserAttributes,
  "id" | "createdAt" | "updatedAt"
> {}

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public username!: string;
  public password!: string;
  public userType!: UserType;
  public btc_available!: number;
  public btc_locked!: number;
  public usd_available!: number;
  public usd_locked!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userType: {
      type: DataTypes.ENUM(...Object.values(UserType)),
      allowNull: false,
      defaultValue: UserType.USER,
    },
    btc_available: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: false,
      defaultValue: 100,
      validate: { min: 0 },
    },
    btc_locked: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    usd_available: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 100000,
      validate: { min: 0 },
    },
    usd_locked: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
  },
);

export default User;
