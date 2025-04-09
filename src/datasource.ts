import { DataSource } from "typeorm";
import { User } from "./entities/userModel";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User],
  synchronize: false,
});
AppDataSource.initialize()
  .then(() => {
    console.log("database");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });
