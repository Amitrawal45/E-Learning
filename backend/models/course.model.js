import mongoose from "mongoose";

const LectureSchema = new mongoose.Schema(
  {
    lectureId: {
      type: String,
      required: true,
    },
    lectureTitle: {
      type: String,
      required: true,
    },
    lectureDuration: {
      type: Number,
      required: true,
    },
    lectureUrl: {
      type: String,
      required: true,
    },
    isPreviewFree: {
      type: Boolean,
      required: true,
    },
    lectureOrder: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const ChapterSchema = new mongoose.Schema(
  {
    chapterId: {
      type: String,
      required: true,
    },
    chapterOrder: {
      type: Number,
      required: true,
    },
    chapterTitle: {
      type: String,
      required: true,
    },
    chapterContent: [LectureSchema],
  },
  { _id: false }
);

const CourseSchema = new mongoose.Schema(
  {
    courseTitle: {
      type: String,
      required: true,
    },
    courseDescription: {
      type: String,
      required: true,
    },
    courseThumbnail: {
      type: String,
    },
    coursePrice: {
      type: Number,
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
      max: 90,
    },
    courseContent: [ChapterSchema],
    courseRatings: [
      {
        userId: {
          type: String,
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
      },
    ],
    educator: {
      type: String,
      ref: "User",
      required: true,
    },
    enrolledStudents: [
      {
        type: String,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    minimize: false,
  }
);

const CourseModel = mongoose.model("Course", CourseSchema);

export default CourseModel;
