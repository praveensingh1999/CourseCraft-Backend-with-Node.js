import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

if (!process.env.RAZORPAY_KEY || !process.env.RAZORPAY_SECRET) {
  throw new Error("Razorpay API keys are missing in environment variables!");
}

export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});
