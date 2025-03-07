import { createContext, useEffect, useState } from "react";
import React from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
export const AppContext = createContext();
import humanizeDuration from "humanize-duration";

export const AppContextProvider = (props) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();
  const [isEducator, setIsEducator] = useState(true);
  const [allcourses, setAllCourses] = useState([]);
  const [enrolledCourses,setEnrolledCourses] = useState([])

  // Fetch all Courses

  const fetchALlCourses = async () => {
    setAllCourses(dummyCourses);
  };

  // Function to calculate average rating of course
  const calculateAverageRating = (course) => {
    if (course.courseRatings.length === 0) {
      return 0;
    }
    let totalRating = 0;
    course.courseRatings.forEach((rating) => {
      totalRating += rating.rating;
    });
    return totalRating / course.courseRatings.length;
  };

  //Function to calculate course chapter time
  const calculateChapterTime = (chapter) => {
    let time = 0;
    chapter.chapterContent.map((lecture) => (time += lecture.lectureDuration));
    return humanizeDuration(time * 60 * 1000, {
      units: ["h", "m"],
    });
  };

  //Function to calculate the course duration
  const calculateCourseDuration = (course) => {
    let time = 0;
    course.courseContent.map((chapter) =>
      chapter.chapterContent.map((lecture) => (time += lecture.lectureDuration))
    );
    return humanizeDuration(time * 60 * 1000, {
      units: ["h", "m"],
    });
  };

  //Function to calculate numbers of lacture in course
  const calculateNumberOfLecture = (course)=>{
    let totalLectures = 0
    course.courseContent.forEach(chapter => {
      if(Array.isArray(chapter.chapterContent)){
        totalLectures += chapter.chapterContent.length
      }
    })
    return totalLectures

  }
  
  //Function to fetch user enrolled courses

  const fetchUserEnrolledCourses = async ()=>{
    setEnrolledCourses(dummyCourses)
  }

  useEffect(() => {
    fetchALlCourses();
    fetchUserEnrolledCourses()
  }, []);

  const value = {
    currency,
    allcourses,
    navigate,
    calculateAverageRating,
    isEducator,
    setIsEducator,
    calculateChapterTime,
    calculateCourseDuration,
    calculateNumberOfLecture,
    enrolledCourses,
    setEnrolledCourses,
    fetchUserEnrolledCourses
  };
  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
