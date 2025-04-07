import { ApiError } from "../utils/ApiError.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { asyncHandler } from "../utils/AsynchHandler.util.js";
import { Task } from "../modals/task.modal.js";
import { User } from "../modals/user.modal.js";


const createTask = asyncHandler(async (req, res, next) => {
    const loggedInAdminId = req.user.id;

    if (!loggedInAdminId) {
        return next(new ApiError(400, "Only Admin can create task"));
    }

    const admin = await User.findById(loggedInAdminId);

    if (!admin) {
        return next(new ApiError(400, "Admin not found"));
    }

    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    if (!title || !description || !status || !priority || !dueDate || !assignedTo) {
        return next(new ApiError(400, "All fields are required"));
    }

    const task = await Task.create({
        title,
        description,
        status,
        priority,
        dueDate,
        assignedTo,
        createdBy:loggedInAdminId,
    });

    if (!task) {
        return next(new ApiError(400, "Failed to create task"));
    }

    admin.myTasks.push(task._id);
    await admin.save();

    res.status(201).json(new ApiResponse(201, true, task, "Task created successfully"));
});

const getAllTasks = asyncHandler(async (req, res, next) => {

});

const deleteTask = asyncHandler(async (req, res, next) => {

});

const updateTask = asyncHandler(async (req, res, next) => {

});

const toggleTask = asyncHandler(async (req, res, next) => {

});

const getTask = asyncHandler(async (req, res, next) => {

});

export {
    createTask,
    getAllTasks,
    deleteTask,
    updateTask,
    toggleTask,
    getTask,
}