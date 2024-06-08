import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "please provide your name"],
        minLength: [4, "atleast 4 characters must be required"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "please provide your password"],
    }
});

export const User = mongoose.model("User", userSchema);