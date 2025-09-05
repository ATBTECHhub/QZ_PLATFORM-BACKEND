import mongoose from "mongoose";
import { Document, Types } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: "admin" | "testCreator" | "testTaker";
    isActive: boolean;
    createdBy?: mongoose.Types.ObjectId;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
