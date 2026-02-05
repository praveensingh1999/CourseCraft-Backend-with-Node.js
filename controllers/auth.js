import bcrypt from "bcryptjs";
import User from "../models/User.js";
import OTP from "../models/Otp.js";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import {mailSender} from "../utils/mailSender.js";
import { passwordUpdated } from "../mail/templates/passwordUpdate.js";
import Profile from "../models/Profile.js";
import dotenv from "dotenv";

dotenv.config();


// signup route 
export const signup = async (req, res) => {
  try {
    // Destructure fields from the request body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      role,
      
      otp,
    } = req.body;

    // Check if All Details are present
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All Fields are required",
      });
    }

    // Check if password & confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and Confirm Password do not match. Please try again.",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please sign in to continue.",
      });
    }

    // Find the most recent OTP
    const response = await OTP.findOne({ email });
      

   if (!response || response.otp !== otp) {
  return res.status(400).json({
    success: false,
    message: "The OTP is not valid",
  });
}


    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Set approval based on role
    let approved = role === "Instructor" ? false : true;
    

    // Create Profile for user
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    // Create the user
    const user = await User.create({
      firstName,
      lastName,
      email,
      
      password: hashedPassword,
      role,
      approved,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    return res.status(200).json({
      success: true,
      user,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
    });
  }
};


// login 
export const login = async (req, res) => {
  try {
    // Get email and password from request body
    const { email, password } = req.body;

    // Check if email or password is missing
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill up all the required fields",
      });
    }

    // Find user with provided email
    const user = await User.findOne({ email }).populate("additionalDetails");

    // User not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered with us. Please sign up to continue",
      });
    }

    // Compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        email: user.email,
        id: user._id,
        role: user.role, 
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    // Add token to user object (not saving in DB)
    user.token = token;
    user.password = undefined;   // set password undefined for security

    // Set cookie
    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      httpOnly: true,
      secure: true, // recommended in production
      sameSite: "None",
    };

    // Send response
    return res.status(200).cookie("token", token, options).json({
      success: true,
      token,
      user,
      message: "User login successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Login failure, please try again",
    });
  }
};


// send otp for email verification 
export const sendotp = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(401).json({
        success: false,
        message: "User is already registered",
      });
    }

    // Generate 6-digit OTP
  

const otp = otpGenerator.generate(6, {
  digits: true,
  lowerCaseAlphabets: false,
  upperCaseAlphabets: false,
  specialChars: false,
});

// delete previous OTPs for email
await OTP.deleteMany({ email });

// save new OTP (email auto-sent by schema hook)
await OTP.create({ email, otp });
    

 

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp, // remove in production
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Could not send OTP",
      error: error.message,
    });
  }
};


// controller for changing password
export const changePassword = async (req, res) => {
  try {
    // Get logged-in user details
    const userDetails = await User.findById(req.user.id);

    // Extract old & new passwords
    const { oldPassword, newPassword } = req.body;

    // Validate old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    );

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    // Encrypt & update new password
    const encryptedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    );

    // Send confirmation email
    try {
      await mailSender(
        updatedUserDetails.email,
        "Your password has been updated",
        passwordUpdated(updatedUserDetails.email, updatedUserDetails.firstName)
      );
    } catch (emailError) {
      console.error("Email error:", emailError);
      return res.status(500).json({
        success: false,
        message: "Password changed but failed to send email",
      });
    }

    // Final response
    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Password update error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update password. Try again later.",
    });
  }
};
