// import mongoose library
import mongoose from "mongoose";

// define the user schema using mongoose schema constructor

const userSchema = new mongoose.Schema(
  {
    // define the name field with type String, required, and trimmed
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
 
    // define email feild with type String, required, and trimmed
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["Admin", "Student", "Instructor"],
      default: "Student",
    },

    additionalDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: false,
    },

    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    image: {
      type: String,
      default: "https://api.dicebear.com/7.x/avatars/svg?seed=default",
    },

    courseProgress: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseProgress",
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
    approved: {
      type: Boolean,
      default: true,
    },
    token: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    
  },
  {
    timestamps: true, // createdAt and updatedAt automatically
  }
);



const User = mongoose.model("User", userSchema);

export default User;
