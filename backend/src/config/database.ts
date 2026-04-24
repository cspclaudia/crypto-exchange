import { Sequelize } from "sequelize";
import { CONFIG } from "./config";

export const sequelize = new Sequelize(
  CONFIG.DB_NAME,
  CONFIG.DB_USER,
  CONFIG.DB_PASSWORD,
  {
    host: CONFIG.DB_HOST,
    port: CONFIG.DB_PORT,
    dialect: "mysql",
    logging: false,
    define: {
      freezeTableName: true,
    },
    dialectOptions: {
      decimalNumbers: true,
    },
  },
);

const tempSequelize = new Sequelize("", CONFIG.DB_USER, CONFIG.DB_PASSWORD, {
  host: CONFIG.DB_HOST,
  port: CONFIG.DB_PORT,
  dialect: "mysql",
  logging: false,
});

export async function createDatabase() {
  try {
    await tempSequelize.query(
      `CREATE DATABASE IF NOT EXISTS \`${CONFIG.DB_NAME}\`;`,
    );
    console.log(`Database "${CONFIG.DB_NAME}" checked/created`);
  } catch (err) {
    console.error("Error creating database:", err);
    throw err;
  }
}
