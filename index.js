import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import dotenv from "dotenv";

import { connectDB } from "./config/database.js"; // ✅ Named import
import { cloudinaryConnect } from "./config/cloudinary.js";

import userRoutes from "./routes/User.js";
import profileRoutes from "./routes/Profile.js";
import paymentRoutes from "./routes/payment.js";
import courseRoutes from "./routes/course.js";
import contactUsRoute from "./routes/Contact.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ================================
// Database Connection
// ================================
connectDB(); // ✅ Use the correct function

// ================================
// Middlewares
// ================================
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

// ================================
// Cloudinary Connection
// ================================
cloudinaryConnect();

// ================================
// Routes
// ================================
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes); 
app.use("/api/v1/reach", contactUsRoute);

// ================================
// Default Route
// ================================
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running....",
  });
});

// ================================
// Server Start
// ================================
app.listen(PORT, () => {
  console.log(`App is running at ${PORT}`);
});
