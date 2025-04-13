import "dotenv/config";
import { DataSource } from "typeorm";
import { User } from "./entities/User";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_DATABASE || "admin_panel",
  synchronize: true,
  logging: process.env.NODE_ENV === "development",
  entities: [User],
  migrations: ["src/migrations/*.ts"],
  subscribers: ["src/subscribers/*.ts"],
}); 