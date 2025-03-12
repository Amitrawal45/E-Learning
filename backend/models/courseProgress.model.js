import mongoose from "mongoose";

const CourseProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    courseId: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    lectureCompleted: [],
  },
  {
    minimize: false,
  }
);

const CourseProgressModel = mongoose.model(
  "CourseProgress",
  CourseProgressSchema
);

export default CourseProgressModel;
