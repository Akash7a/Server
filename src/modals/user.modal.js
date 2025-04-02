import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";


const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
            lowercase: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
            lowercase: true,
        },
        profilePicture: {
            type: String,
        },
        password: {
            type: String,
            required: true,
            trim: true,
        },
        role: {
            type: String,
            enum: ["admin", "user"],
            default: "user",
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.validatePassword = async function (password) {
    return bcrypt.compare(password, this.password);
}

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ id: this._id, }
        , process.env.JWT_SECRET, {
        expiresIn: "7d",
    }
    )
    return token;
}

export const User = mongoose.model("User", userSchema);