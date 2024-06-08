import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title: String,
    summary: String,
    content: String,
    cover: String,
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    }
}, {
    timestamps: true,
});

export const Post = mongoose.model("Post", postSchema);