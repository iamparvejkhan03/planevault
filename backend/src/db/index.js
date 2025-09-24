import mongoose from "mongoose";
import "dotenv/config";

const dbConnect = async () => {
    try {
        const db = await mongoose.connect(`${process.env.MONGODB_URI}/planevault`);

        if(!db){
            console.error('MongoDB connection failed.');
        }

        console.log('MongoDB connected.');
    } catch (error) {
        throw new Error(error);
    }
}

export default dbConnect;