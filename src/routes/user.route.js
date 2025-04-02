import { Router } from 'express';
import { body } from "express-validator";
import {verify} from "../middlewares/auth.middleware.js";

import {
    registerUser,
    loginUser,
    getUser,
    updateUser,
    logoutUser,
} from '../controllers/user.controller.js';
import upload from '../middlewares/multer.middleware.js';

const userRouter = Router();

userRouter.route("/register").post(
    upload.single('profilePicture'),
    [
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
        body('username').notEmpty().withMessage('username is required')
    ],
    registerUser
);
userRouter.route("/login").post(
    [
        body('email').optional().isEmail().withMessage('Please provide a valid email'),
        body('username').optional().notEmpty().withMessage('Username is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    ],
    loginUser
);
userRouter.route("/profile").get(verify,getUser);
userRouter.route("/update").put(
    [
        body('email').optional().isEmail().withMessage('Please provide a valid email'),
        body('username').optional().notEmpty().withMessage('Username is required'),
    ],
    verify,
    updateUser
);
userRouter.route("/logout").post(verify,logoutUser);

export {
    userRouter,
}