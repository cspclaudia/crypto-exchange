import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { OrderStatus, OrderType } from "../enums/OrderEnums";
import User from "./User";

export interface OrderAttributes {
  id: number;
  userId: number;
  type: OrderType;
  amountBtc: number;
  priceUsd: number;
  status: OrderStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderCreationAttributes extends Optional<
  OrderAttributes,
  "id" | "status"
> {}

export class Order
  extends Model<OrderAttributes, OrderCreationAttributes>
  implements OrderAttributes
{
  public id!: number;
  public userId!: number;
  public type!: OrderType;
  public amountBtc!: number;
  public priceUsd!: number;
  public status!: OrderStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public user?: User;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(OrderType)),
      allowNull: false,
    },
    amountBtc: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: false,
      validate: { min: 0.00000001 },
    },
    priceUsd: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      validate: { min: 0.01 },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      defaultValue: OrderStatus.OPEN,
    },
  },
  {
    sequelize,
    tableName: "orders",
    timestamps: true,
  },
);

Order.belongsTo(User, { foreignKey: "userId", as: "user" });

export default Order;
