import Profile from "../models/Profile.js"
import CourseProgress from "../models/CourseProgress.js"
import Course from "../models/Course.js"
import User from "../models/User.js"
import { uploadImageToCloudinary } from "../utils/imageUploader.js"
import mongoose from "mongoose"
import { convertSecondsToDuration } from "../utils/secToDuration.js"

// ================================
// Update Profile
// ================================
export const updateProfile = async (req, res) => {
  try {
    const {
      
      dateOfBirth ,
      about ,
      contactNumber,
      gender 
    } = req.body

    const id = req.user.id
//console.log("dob", typeof dateOfBirth, dateOfBirth);
    // Find user and profile
    const userDetails = await User.findById(id)
    const profile = await Profile.findById(userDetails.additionalDetails)

   

    // Update profile fields

   if (dateOfBirth) profile.dateOfBirth = dateOfBirth;
if (about) profile.about = about;
if (contactNumber) profile.contactNumber = contactNumber;
if (gender) profile.gender = gender;
    await profile.save()

    // Fetch updated user
    const updatedUserDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec()

    return res.json({
      success: true,
      message: "Profile updated successfully",
      updatedUserDetails,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

// ================================
// Delete Account
// ================================
export const deleteAccount = async (req, res) => {
  try {
    const id = req.user.id

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Delete associated profile
    await Profile.findByIdAndDelete(
      new mongoose.Types.ObjectId(user.additionalDetails)
    )

    // Remove user from enrolled courses
    for (const courseId of user.courses) {
      await Course.findByIdAndUpdate(courseId, {
        $pull: { studentsEnroled: id },
      })
    }

    // Delete course progress
    await CourseProgress.deleteMany({ userId: id })

    // Delete user
    await User.findByIdAndDelete(id)

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "User cannot be deleted successfully",
    })
  }
}

// ================================
// Get All User Details
// ================================
export const getAllUserDetails = async (req, res) => {
  try {
    const id = req.user.id

    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec()

    return res.status(200).json({
      success: true,
      message: "User data fetched successfully",
      data: userDetails,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ================================
// Update Display Picture
// ================================
export const updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture
    const userId = req.user.id

    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    )

    const updatedProfile = await User.findByIdAndUpdate(
      userId,
      { image: image.secure_url },
      { new: true }
    )

    return res.status(200).json({
      success: true,
      message: "Image updated successfully",
      data: updatedProfile,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ================================
// Get Enrolled Courses
// ================================
export const getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id

    let userDetails = await User.findById(userId)
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        },
      })
      .exec()

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      })
    }

    userDetails = userDetails.toObject()

    for (let i = 0; i < userDetails.courses.length; i++) {
      let totalDurationInSeconds = 0
      let subsectionLength = 0

      for (let j = 0; j < userDetails.courses[i].courseContent.length; j++) {
        const subsections =
          userDetails.courses[i].courseContent[j].subSection

        totalDurationInSeconds += subsections.reduce(
          (acc, curr) => acc + parseInt(curr.timeDuration),
          0
        )

        subsectionLength += subsections.length
      }

      userDetails.courses[i].totalDuration =
        convertSecondsToDuration(totalDurationInSeconds)

      const courseProgress = await CourseProgress.findOne({
        courseID: userDetails.courses[i]._id,
        userId: userId,
      })

      const completedVideosCount =
        courseProgress?.completedVideos.length || 0

      userDetails.courses[i].progressPercentage =
        subsectionLength === 0
          ? 100
          : Math.round((completedVideosCount / subsectionLength) * 10000) / 100
    }

    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ================================
// Instructor Dashboard
// ================================
export const instructorDashboard = async (req, res) => {
  try {
      // console.log("inside instructor");
    const courses = await Course.find({ instructor: req.user.id })

    const courseData = courses.map((course) => {
      const totalStudentsEnrolled = course.studentsEnrolled.length
      const totalAmountGenerated = totalStudentsEnrolled * course.price

      return {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        totalStudentsEnrolled,
        totalAmountGenerated,
      }
    })

    return res.status(200).json({
      success: true,
      courses: courseData,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}
