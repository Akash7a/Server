import jwt from "jsonwebtoken";
import { User } from "../modals/user.modal.js";

export const verify = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Uanauthorized request:No token provided" });
        }

        let decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        if (!decodedToken) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }

        const user = await User.findById(decodedToken.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Unauthorized request", error)
        return res.status(500).json({ message: "Failed to generate the token Error::", error });
    }
}