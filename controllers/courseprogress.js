import mongoose from "mongoose";
import Section from "../models/Section.js";
import SubSection from "../models/SubSection.js";
import CourseProgress from "../models/CourseProgress.js";
import Course from "../models/Course.js";

export const updateCourseProgress = async (req, res) => {
  const { courseId, subsectionId } = req.body;
  const userId = req.user.id;

  try {
    // 1️⃣ Validate subsection
    const subsection = await SubSection.findById(subsectionId);
    if (!subsection) {
      return res.status(404).json({
        success: false,
        message: "Invalid subsection",
      });
    }

    // 2️⃣ Find course progress for this user & course
    const courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId,
    });

    if (!courseProgress) {
      return res.status(404).json({
        success: false,
        message: "Course progress does not exist",
      });
    }

    // 3️⃣ Prevent duplicate completion
    if (courseProgress.completedVideos.includes(subsectionId)) {
      return res.status(400).json({
        success: false,
        message: "Subsection already completed",
      });
    }

    // 4️⃣ Mark subsection as completed
    courseProgress.completedVideos.push(subsectionId);

    // 5️⃣ Save progress
    await courseProgress.save();

    return res.status(200).json({
      success: true,
      message: "Course progress updated successfully",
    });
  } catch (error) {
    console.error("Update Course Progress Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }

};



export const getProgressPercentage = async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user.id;

  if (!courseId) {
    return res.status(400).json({
      success: false,
      message: "Course ID not provided",
    });
  }

  try {
    // 1️⃣ Get course progress of user
    const courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId,
    }).populate({
      path: "courseID",
      populate: {
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      },
    });

    if (!courseProgress) {
      return res.status(404).json({
        success: false,
        message: "Course progress not found",
      });
    }

    // 2️⃣ Count total lectures
    let totalLectures = 0;

    courseProgress.courseID.courseContent.forEach((section) => {
      totalLectures += section.subSection.length;
    });

    // 3️⃣ Edge case: no lectures
    if (totalLectures === 0) {
      return res.status(200).json({
        success: true,
        progressPercentage: 0,
      });
    }

    // 4️⃣ Calculate progress
    const completedLectures = courseProgress.completedVideos.length;

    let progressPercentage =
      (completedLectures / totalLectures) * 100;

    // round to 2 decimal places
    progressPercentage = Math.round(progressPercentage * 100) / 100;

    return res.status(200).json({
      success: true,
      progressPercentage,
      completedLectures,
      totalLectures,
    });
  } catch (error) {
    console.error("Progress Percentage Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

