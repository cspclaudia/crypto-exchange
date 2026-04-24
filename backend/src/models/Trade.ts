import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { Order } from "./Order";

export interface TradeAttributes {
  id: number;
  buyOrderId: number;
  sellOrderId: number;
  buyUserId: number;
  sellUserId: number;
  amountBtc: number;
  priceUsd: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TradeCreationAttributes extends Optional<
  TradeAttributes,
  "id"
> {}

export class Trade
  extends Model<TradeAttributes, TradeCreationAttributes>
  implements TradeAttributes
{
  public id!: number;
  public buyOrderId!: number;
  public sellOrderId!: number;
  public buyUserId!: number;
  public sellUserId!: number;
  public amountBtc!: number;
  public priceUsd!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public buyOrder?: Order;
  public sellOrder?: Order;
}

Trade.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    buyOrderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    sellOrderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    buyUserId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    sellUserId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    amountBtc: {
      type: DataTypes.DECIMAL(18, 8).UNSIGNED,
      allowNull: false,
      validate: { min: 0.00000001 },
    },
    priceUsd: {
      type: DataTypes.DECIMAL(18, 2).UNSIGNED,
      allowNull: false,
      validate: { min: 0.01 },
    },
  },
  {
    sequelize,
    tableName: "trades",
    timestamps: true,
  },
);

Trade.belongsTo(Order, { foreignKey: "buyOrderId", as: "buyOrder" });
Trade.belongsTo(Order, { foreignKey: "sellOrderId", as: "sellOrder" });

export default Trade;
