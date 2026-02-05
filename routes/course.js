import express from "express"
const router = express.Router()

// ================================
// Course Controllers
// ================================
import {
  createCourse,
  getAllCourses,
  getCourseDetails,
  getFullCourseDetails,
  editCourse,
  getInstructorCourses,
  deleteCourse,
} from "../controllers/Course.js"

// ================================
// Category Controllers
// ================================
import {
  showAllCategories,
  createCategory,
  categoryPageDetails,
} from "../controllers/Category.js"

// ================================
// Section Controllers
// ================================
import {
  createSection,
  updateSection,
  deleteSection,
} from "../controllers/section.js"

// ================================
// SubSection Controllers
// ================================
import {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} from "../controllers/subsection.js"

// ================================
// Rating Controllers
// ================================
import {
  createRating,
  getAverageRating,
  getAllRating,
} from "../controllers/ratingandreview.js"

// ================================
// Course Progress Controller
// ================================
import { updateCourseProgress } from "../controllers/courseProgress.js"

// ================================
// Middlewares
// ================================
import {
  auth,
  isInstructor,
  isStudent,
  isAdmin,
} from "../middlewares/auth.js"

// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************

// Create Course (Instructor only)
router.post("/createCourse", auth, isInstructor, createCourse)

// Add a Section to a Course
router.post("/addSection", auth, isInstructor, createSection)

// Update a Section
router.post("/updateSection", auth, isInstructor, updateSection)

// Delete a Section
router.post("/deleteSection", auth, isInstructor, deleteSection)

// Add a Sub Section to a Section
router.post("/addSubSection", auth, isInstructor, createSubSection)

// Update Sub Section
router.post("/updateSubSection", auth, isInstructor, updateSubSection)

// Delete Sub Section
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection)

// Get all Registered Courses
router.get("/getAllCourses", getAllCourses)

// Get Course Details
router.post("/getCourseDetails", getCourseDetails)

// Get Full Course Details (Authenticated)
router.post("/getFullCourseDetails", auth, getFullCourseDetails)

// Edit Course
router.post("/editCourse", auth, isInstructor, editCourse)

// Get Instructor Courses
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses)

// Delete Course
router.delete("/deleteCourse", deleteCourse)

// Update Course Progress (Student only)
router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress)

// ********************************************************************************************************
//                                      Category routes (Admin only)
// ********************************************************************************************************

router.post("/createCategory", auth, isAdmin, createCategory)
router.get("/showAllCategories", showAllCategories)
router.post("/getCategoryPageDetails", categoryPageDetails)

// ********************************************************************************************************
//                                      Rating & Review routes
// ********************************************************************************************************

router.post("/createRating", auth, isStudent, createRating)
router.get("/getAverageRating", getAverageRating)
router.get("/getReviews", getAllRating)

export default router
