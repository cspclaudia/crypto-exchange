import { Umzug, SequelizeStorage } from "umzug";
import { sequelize } from "./database";

export const migrator = new Umzug({
  migrations: { glob: "dist/migrations/*.js" },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

export async function runMigrations() {
  try {
    await migrator.up();
    console.log("Migrations executed successfully");
  } catch (err) {
    console.error("Migration error:", err);
    throw err;
  }
}
