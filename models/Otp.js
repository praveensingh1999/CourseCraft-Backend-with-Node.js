import mongoose from "mongoose";
import { mailSender } from "../utils/mailSender.js";
import { emailTemplate } from "../mail/templates/emailVerficationTemplate.js";

const OtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5, // 5 minutes
  },
});

/**
 * Send verification email
 */
async function sendVerificationEmail(email, otp) {
  await mailSender(
    email,
    "Email Verification OTP",
    emailTemplate(otp)
  );
}

/**
 * Pre-save hook
 * Runs ONLY when a new OTP is created
 */
OtpSchema.pre("save", async function () {
  if (!this.isNew) return;

  await sendVerificationEmail(this.email, this.otp);
});

export default mongoose.model("Otp", OtpSchema);
