import mongoose from "mongoose";

const schema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
   duration: { type: Number, default: 0 }, 
  video: {
    type: String,
    require: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Courses",
    require: true,
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chapter",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Lecture = mongoose.model("Lecture", schema);
