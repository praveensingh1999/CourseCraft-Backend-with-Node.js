// logic
// 1️⃣ Frontend selects multiple courses
// 2️⃣ Backend creates Razorpay Order
// 3️⃣ Frontend completes payment via Razorpay
// 4️⃣ Razorpay sends payment details + signature
// 5️⃣ Backend verifies signature
// 6️⃣ Student is enrolled in courses
// 7️⃣ Emails are sent

import { instance } from "../config/razorpay.js";
import Course from "../models/Course.js";
import crypto from "crypto";
import User from "../models/User.js";
import { mailSender } from "../utils/mailSender.js";

import { courseEnrollmentEmail } from "../mail/templates/courseEnrollmentEmail.js";
import { paymentSuccessEmail } from "../mail/templates/paymentSucessEmail.js";
import CourseProgress from "../models/CourseProgress.js";

/* =====================================================
   CREATE ORDER
===================================================== */
export const capturePayment = async (req, res) => {
  //console.log("=== PAYMENT START ===");
  try {
     

    //console.log("BODY:", req.body);
    //console.log("USER:", req.user);

    const { courses } = req.body;
    const userId = req.user.id;

    if (!courses || courses.length === 0) {
      return res.json({
        success: false,
        message: "No courses provided",
      });
    }

    let totalAmount = 0;

    for (const courseId of courses) {
      const course = await Course.findById(courseId);

      if (!course) {
        return res.json({
          success: false,
          message: "Course not found",
        });
      }

      // ✅ FIX: ObjectId comparison
      if (
  course.studentsEnrolled?.some(
    (id) => id.toString() === userId.toString()
  )
) {
  return res.status(400).json({
    success: false,
    message: "Already enrolled in course",
  });
}

      totalAmount += course.price;
    }

    const order = await instance.orders.create({
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    // ✅ frontend expects "message"
    return res.status(200).json({
      success: true,
      message: order,
    });
  } catch (error) {
    console.log("CAPTURE PAYMENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Could not initiate payment",
    });
  }
};

/* =====================================================
   VERIFY PAYMENT
===================================================== */
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courses,
    } = req.body;

    const userId = req.user.id;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    await enrollStudents(courses, userId);

    return res.status(200).json({
      success: true,
      message: "Payment verified & enrolled",
    });
  } catch (error) {
    console.log("VERIFY PAYMENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Could not verify payment",
    });
  }
};

/* =====================================================
   SEND PAYMENT SUCCESS EMAIL
===================================================== */
export const sendPaymentSuccessEmail = async (req, res) => {
  try {
    const { orderId, paymentId, amount } = req.body;

    const user = await User.findById(req.user.id);

    await mailSender(
      user.email,
      "Payment Successful",
      paymentSuccessEmail(
        `${user.firstName} ${user.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    );

    return res.status(200).json({
      success: true,
      message: "Payment success email sent",
    });
  } catch (error) {
    console.log("PAYMENT EMAIL ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Could not send payment email",
    });
  }
};

/* =====================================================
   ENROLL STUDENTS
===================================================== */
const enrollStudents = async (courses, userId) => {
  for (const courseId of courses) {
    const course = await Course.findByIdAndUpdate(
      courseId,
      { $push: { studentsEnrolled: userId } },
      { new: true }
    );

    const courseProgress = await CourseProgress.create({
      courseID: courseId,
      userId,
      completedVideos: [],
    });

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          courses: courseId,
          courseProgress: courseProgress._id,
        },
      },
      { new: true }
    );

    await mailSender(
      user.email,
      `Enrolled in ${course.courseName}`,
      courseEnrollmentEmail(
        course.courseName,
        `${user.firstName} ${user.lastName}`
      )
    );
  }
};
