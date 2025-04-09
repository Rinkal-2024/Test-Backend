import express from "express";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });
import { AppDataSource } from "./datasource";
import "reflect-metadata";
import cors from "cors";
import { userRoutes } from "./route/authRoute";

const PORT = process.env.PORT;
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
AppDataSource.initialize().then((connection) => {
  app.use("/api/auth", userRoutes);

  app.get("/", (req, res) => {
    res.send("hii");
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
