import { Router } from "express";
import {
    createTask,
    deleteTask,
    getAllTasks,
    getTask,
    toggleTask,
    updateTask,
}
    from
    "../controllers/task.controller.js";

import { verify } from "../middlewares/auth.middleware.js";

const taskRouter = Router();


taskRouter.route("/create").post(verify, createTask);
taskRouter.route("/delete/:id").delete(verify, deleteTask);
taskRouter.route("/getAllTasks").get(verify, getAllTasks);
taskRouter.route("/getSingleTask/:id").get(verify, getTask);
taskRouter.route("/toggleTask/:id").put(verify, toggleTask);
taskRouter.route("/update/:id").put(verify, updateTask);

export {
    taskRouter
}