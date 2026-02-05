// Import required modules
import express from "express";

import {
  capturePayment,
  verifyPayment,
  sendPaymentSuccessEmail,
} from "../controllers/payment.js";

import {
  auth,
  isInstructor,
  isStudent,
  isAdmin,
} from "../middlewares/auth.js";

const router = express.Router();

router.post("/capturePayment", auth, isStudent, capturePayment);
router.post("/verifyPayment", auth, isStudent, verifyPayment);
router.post(
  "/sendPaymentSuccessEmail",
  auth,
  isStudent,
  sendPaymentSuccessEmail
);

export default router;