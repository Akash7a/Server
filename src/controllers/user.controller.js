import { User } from "../modals/user.modal.js";
import { validationResult } from "express-validator";
import { uploadOnCloudinary } from "../utils/cloudinary.util.js";
import { ApiError } from "../utils/ApiError.util.js";
import { asyncHandler } from "../utils/AsynchHandler.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";

const cookieOptions = {
    httpOnly: true,
    secure: true, // process.env.NODE_ENV === "production",
    sameSite: "Strict",
};

const registerUser = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return next(new ApiError(400, "Validation errors", errors.array()));
    }

    const { email, username, role, password } = req.body;

    if (!email || !username || !password) {
        return next(new ApiError(400, "Please provide all required fields."));
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
        return next(new ApiError(400, "User already exists."));
    }

    const profileLocalPath = req.file.path;
    const profile = await uploadOnCloudinary(profileLocalPath);

    if (!profile || !profile.url) {
        return next(new ApiError(500, "Failed to upload profile picture to Cloudinary."));
    }

    const newUser = await User.create({
        email,
        username,
        password,
        role,
        profilePicture: profile.url,
    });

    newUser.password = undefined;

    if (!newUser) {
        return next(new ApiError(400, "Failed to create user."));
    }

    const token = newUser.generateAuthToken();

    if (!token) {
        return next(new ApiError(400, "Failed to generate token."));
    }

    res.cookie("token", token, cookieOptions);
    return res.status(201).json(new ApiResponse(201, "User registered successfully!", {
        user: { ...newUser._doc, password: undefined },
        token,
    }));
});

const loginUser = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return next(new ApiError(400, "Validation errors", errors.array()));
    }

    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
        return next(new ApiError(400, "Please provide all required fields."));
    }

    const user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] }).select("+password");

    if (!user) {
        return next(new ApiError(400, "Invalid credentials."));
    }

    const isMatch = await user.validatePassword(password);

    if (!isMatch) {
        return next(new ApiError(400, "Invalid credentials."));
    }

    const token = user.generateAuthToken();

    if (!token) {
        return next(new ApiError(400, "Failed to generate token."));
    }

    res.cookie("token", token, cookieOptions);
    return res.status(200).json(new ApiResponse(200, "User logged in successfully!", {
        user: { ...user._doc, password: undefined },
        token,
    }));
});

const getUser = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
        return next(new ApiError(404, "User not found."));
    }

    return res.status(200).json(new ApiResponse(200, "User retrieved successfully!", user));
});

const updateUser = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;

    if (!userId) {
        return next(new ApiError(401, "Unauthorized request: No token provided."));
    }

    const user = await User.findById(userId);
    if (!user) {
        return next(new ApiError(404, "User not found."));
    }

    const { email, username, role } = req.body;

    if (email && email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return next(new ApiError(400, "Email already in use by another user."));
        }
    }

    if (username && username !== user.username) {
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            return next(new ApiError(400, "Username already in use by another user."));
        }
    }

    if (role && user.role !== "admin") {
        return next(new ApiError(403, "Unauthorized: Only admins can change roles."));
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { email, username },
        { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
        return next(new ApiError(400, "Failed to update user."));
    }

    return res.status(200).json(new ApiResponse(200, "User updated successfully!", updatedUser));
});

const deleteUser = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;

    if (!userId) {
        return next(new ApiError(401, "Unauthorized request: No token provided."));
    }

    const user = await User.findById(userId);

    if (!user) {
        return next(new ApiError(404, "User not found."));
    }

    await User.findByIdAndDelete(userId);

    return res.status(200).json(new ApiResponse(200, "User deleted successfully!"));
});

const logoutUser = asyncHandler(async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return next(new ApiError(400, "No token found, user already logged out."));
    }

    res.clearCookie("token", cookieOptions);

    return res.status(200).json(new ApiResponse(200, "User logged out successfully!"));
});

export {
    registerUser,
    loginUser,
    getUser,
    updateUser,
    logoutUser,
    deleteUser,
}