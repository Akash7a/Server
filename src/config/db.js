import mongoose from "mongoose";
import {DB_NAME} from "../constant.js";


const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("MongoDB connection host::",connectionInstance.connection.host);
    } catch (error) {
        console.error(`Mongodb connection failed: ${error.message}`);
        process.exit(1);
    }
}
export {
    connectDB
}