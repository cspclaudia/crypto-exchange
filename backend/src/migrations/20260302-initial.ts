import { QueryInterface, DataTypes } from "sequelize";

export async function up({ context }: { context: QueryInterface }) {
  const queryInterface = context;

  await queryInterface.createTable("users", {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    userType: {
      type: DataTypes.ENUM("USER", "ADMIN"),
      allowNull: false,
      defaultValue: "USER",
    },
    btc_available: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: false,
      defaultValue: 100,
    },
    btc_locked: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: false,
      defaultValue: 0,
    },
    usd_available: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 100000,
    },
    usd_locked: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  await queryInterface.createTable("orders", {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    type: { type: DataTypes.ENUM("BUY", "SELL"), allowNull: false },
    amountBtc: { type: DataTypes.DECIMAL(18, 8), allowNull: false },
    priceUsd: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    status: {
      type: DataTypes.ENUM("OPEN", "TRADED", "CANCELED"),
      allowNull: false,
      defaultValue: "OPEN",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  await queryInterface.createTable("trades", {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    buyOrderId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    sellOrderId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    buyUserId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    sellUserId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    amountBtc: { type: DataTypes.DECIMAL(18, 8), allowNull: false },
    priceUsd: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });
}

export async function down({ context }: { context: QueryInterface }) {
  const queryInterface = context;

  await queryInterface.dropTable("trades");
  await queryInterface.dropTable("orders");
  await queryInterface.dropTable("users");
}
