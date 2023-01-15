import express from "express";
import dotenv from "dotenv";
// import cors from "cors";
import { router } from "./routes";

dotenv.config();

export const app = express();
app.use(express.json({}));
// app.use(cors({ origin: "*" })); 
app.use(router);
