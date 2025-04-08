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

    const existingTask = await Task.findOne({title});

    if(existingTask){
        return next(new ApiError(400,"Task already exists try with diffrent title."));
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

    if (!admin.myTasks.includes(task._id)) {
        admin.myTasks.push(task._id);
    }
    await admin.save();

    res.status(201).json(new ApiResponse(201, task, "Task created successfully", true));
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

    const tasks = await Task.find({ createdBy: loggedInAdminId })
    .populate("assignedTo")
    .sort({ createdAt: -1 });
    
    console.log("Fetched tasks:", tasks.length);

    if (!tasks.length) {
        return next(new ApiError(400, "Failed to get tasks"));
    }

    res.status(200).json(new ApiResponse(200, tasks, "Tasks fetched successfully", true));

});

const deleteTask = asyncHandler(async (req, res, next) => {
    const loggedInAdminId = req.user.id;
    const { id: taskId } = req.params;

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

    res.status(200).json(new ApiResponse(200, null, "Task deleted successfully", true));
});

const updateTask = asyncHandler(async (req, res, next) => {
    const loggedInAdminId = req.user.id;

    if (!loggedInAdminId) {
        return next(new ApiError(400, "Only Admin can update task"));
    }

    const admin = await User.findById(loggedInAdminId);

    if (!admin) {
        return next(new ApiError(400, "Admin not found"));
    }

    const { id: taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
        return next(new ApiError(400, "Task not found"));
    }

    if (task.createdBy.toString() !== loggedInAdminId) {
        return next(new ApiError(400, "You are not authorized to update this task"));
    }

    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    if (!title || !description || !status || !priority || !dueDate || !assignedTo) {
        return next(new ApiError(400, "All fields are required"));
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, {
        title,
        description,
        status,
        priority,
        dueDate,
        assignedTo,
        createdBy: loggedInAdminId,
    }, {
        new: true,
    });

    if (!updatedTask) {
        return next(new ApiError(400, "Failed to update task"));
    }

    const updatedAdmin = await User.findById(loggedInAdminId).populate("myTasks");

    if (!updatedAdmin) {
        return next(new ApiError(400, "Admin not found"));
    }

    res.status(200).json(new ApiResponse(200, updatedTask, "Task updated successfully", true));
});

const toggleTask = asyncHandler(async (req, res, next) => {
    const loggedInAdminId = req.user.id;

    if (!loggedInAdminId) {
        return next(new ApiError(400, "Only Admin can toggle task"));
    }

    const { id: taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
        return next(new ApiError(400, "Task not found"));
    }

    if (task.createdBy.toString() !== loggedInAdminId) {
        return next(new ApiError(400, "You are not authorized to toggle this task"));
    }

    switch (task.status) {
        case "pending":
            task.status = "in-progress";
            break;
        case "in-progress":
            task.status = "completed";
            break;
        case "completed":
            task.status = "pending";
            break;
        default:
            return next(new ApiError(400, "invalid task status"));
    }

    await task.save();

    return res.status(200).json(new ApiResponse(200, task, "Task toggled successfully", true));
});

const getTask = asyncHandler(async (req, res, next) => {
    const loggedInAdminId = req.user.id;

    if (!loggedInAdminId) {
        return next(new ApiError(400, "Unauthorized request: Admin not found!"));
    }

    const { id: taskId } = req.params;

    const task = await Task.findById(taskId).populate("assignedTo");

    if (!task) {
        return next(new ApiError(400, "Task not found"));
    }

    if (task.createdBy.toString() !== loggedInAdminId) {
        return next(new ApiError(400, "You are not authorized to access this task"));
    }

    return res.status(200).json(new ApiResponse(200, task, "Task fetched successfully", true));
});

export {
    createTask,
    getAllTasks,
    deleteTask,
    updateTask,
    toggleTask,
    getTask,
}