import { v2 as cloudinary } from "cloudinary";

// Connect to Cloudinary
export const cloudinaryConnect = () => {
  try {
    cloudinary.config({
      //! ######## Configuring Cloudinary to Upload MEDIA ########
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    });
    console.log("Cloudinary connected successfully!");
  } catch (error) {
    console.error("Cloudinary connection error:", error);
  }
};

// Optional: Export cloudinary instance if you want to use it directly
export { cloudinary };