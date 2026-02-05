import express from "express"
const router = express.Router()

// ================================
// Controllers
// ================================
import {
  login,
  signup,
  sendotp,
  changePassword,
} from "../controllers/Auth.js"

import {
  resetPasswordToken,
  resetPassword,
} from "../controllers/resetPassword.js"

// ================================
// Middleware
// ================================
import { auth } from "../middlewares/auth.js"

// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************

// User login
router.post("/login", login)

// User signup
router.post("/signup", signup)

// Send OTP to user's email
router.post("/sendotp", sendotp)

// Change password (Authenticated)
router.post("/changepassword", auth, changePassword)

// ********************************************************************************************************
//                                      Reset Password routes
// ********************************************************************************************************

// Generate reset password token
router.post("/reset-password-token", resetPasswordToken)

// Reset password using token
router.post("/reset-password", resetPassword)

export default router
