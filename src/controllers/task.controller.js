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
        createdBy: loggedInAdminId,
    });

    if (!task) {
        return next(new ApiError(400, "Failed to create task"));
    }

    admin.myTasks.push(task._id);
    await admin.save();

    res.status(201).json(new ApiResponse(201, true, task, "Task created successfully"));
});

const getAllTasks = asyncHandler(async (req, res, next) => {
    const loggedInAdminId = req.user.id;

    if (!loggedInAdminId) {
        return next(new ApiError(400, "Only Admin can get all tasks"));
    };

    const admin = await User.findById(loggedInAdminId);

    if (!admin) {
        return next(new ApiError(400, "Admin not found"));
    }

    console.log("Fetching tasks for admin:", loggedInAdminId);

    const tasks = await Task.find({ createdBy: loggedInAdminId }).populate("assignedTo").sort({ createdAt: -1 });

    console.log("Fetched tasks:", tasks.length);

    if (!tasks.length) {
        return next(new ApiError(400, "Failed to get tasks"));
    }

    res.status(200).json(new ApiResponse(200, true, tasks, "Tasks fetched successfully"));

});

const deleteTask = asyncHandler(async (req, res, next) => {
    const loggedInAdminId = req.user.id;
    const { id:taskId } = req.params;

    if (!loggedInAdminId) {
        return next(new ApiError(400, "Only Admin can delete task"));
    }

    const admin = await User.findById(loggedInAdminId);

    if (!admin) {
        return next(new ApiError(400, "Admin not found"));
    }

    const task = await Task.findById(taskId);

    if (!task) {
        return next(new ApiError(400, "Task not found"));
    }

    if (task.createdBy.toString() !== loggedInAdminId) {
        return next(new ApiError(400, "You are not authorized to delete this task"));
    }

    await Task.findByIdAndDelete(taskId);

    admin.myTasks = admin.myTasks.filter(taskIdInArray => taskIdInArray.toString() !== taskId);

    await admin.save();

    res.status(200).json(new ApiResponse(200, true, null, "Task deleted successfully"));
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