import mongoose from "mongoose";

const schema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Courses",
        require: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

export const Chapter = mongoose.model("Chapter", schema);