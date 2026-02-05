import express from "express"
const router = express.Router()

import { auth, isInstructor, isStudent } from "../middlewares/auth.js"

import {
  deleteAccount,
  updateProfile,
  getAllUserDetails,
  updateDisplayPicture,
  getEnrolledCourses,
  instructorDashboard,
} from "../controllers/profile.js"

// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************

// Delete User Account
router.delete("/deleteProfile", auth, isStudent, deleteAccount)

// Update Profile
router.put("/updateProfile", auth, updateProfile)

// Get User Details
router.get("/getUserDetails", auth, getAllUserDetails)

// Get Enrolled Courses
router.get("/getEnrolledCourses", auth, getEnrolledCourses)

// Update Display Picture
router.put("/updateDisplayPicture", auth, updateDisplayPicture)

// Instructor Dashboard
router.get(
  "/instructorDashboard",
  auth,
  isInstructor,
  instructorDashboard
)

export default router
