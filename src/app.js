import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";


const app = express();

app.use(cors());
dotenv.config({
    path: "../.env",
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

import { userRouter } from "./routes/user.route.js";
import { taskRouter } from "./routes/task.route.js";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/task",taskRouter);

export default app;