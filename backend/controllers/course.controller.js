import CourseModel from "../models/course.model.js";

// Get All courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await CourseModel.find({
      isPublished: true,
    })
      .select(["-courseContent", "-enrolledStudents"])
      .populate({
        path: "educator",
      });
    res.json({
      success: true,
      courses,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Get Course By Id

export const getCourseById = async (req, res) => {
  const { id } = req.params;
  try {
    const courseData = await CourseModel.findById(id).populate({
      path: "educator",
    });

    //Remove lectureUrl is PreviewFree is False
    courseData.courseContent.forEach((chapter) => {
      chapter.chapterContent.forEach((lecture) => {
        if (!lecture.isPreviewFree) {
          lecture.lectureUrl = "";
        }
      });
    });
    res.json({
      success: true,
      course: courseData,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};
