// Importing required modules
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

// Load environment variables
dotenv.config();



// This function is used as middleware to authenticate user requests

export const auth = async (req, res, next) => {
	try {
		// Extracting JWT from request cookies, body or header

		const token =
			req.cookies?.token ||
			req.body?.token ||
			req.header("Authorization")?.replace("Bearer ", "");
      console.log('inside auth', token);

		// If JWT is missing, return 401 Unauthorized response
		if (!token) {
			return res.status(401).json({ success: false, message: `Token Missing` });
		}

		try {
			// Verifying the JWT using the secret key stored in environment variables
			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			// Storing the decoded JWT payload in the request object for further use
			req.user = decoded;
		} catch (error) {
			// If JWT verification fails, return 401 Unauthorized response
			return res
				.status(401)
				.json({ success: false, message: "Token is invalid" , error});
		}

		// If JWT is valid, move on to the next middleware or request handler
		next();
	} catch (error) {
		// If there is an error during the authentication process, return 401 Unauthorized response
		return res.status(401).json({
			success: false,
			message: `Something Went Wrong While Validating the Token`,
      error
		});
	}
};


export const isStudent = async (req, res, next) => {
  try {
    const userDetails = await User.findOne({ email: req.user.email });

    if (userDetails.role !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is a Protected Route for Students",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User Role Can't be Verified",
      error
    });
  }
};


export const isAdmin = async (req, res, next) => {
  try {
    const userDetails = await User.findOne({ email: req.user.email });

    if (userDetails.role !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is a Protected Route for Admin",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User Role Can't be Verified",
      error
    });
  }
};


export const isInstructor = async (req, res, next) => {
  try {
    const userDetails = await User.findOne({ email: req.user.email });
    console.log(userDetails);
    console.log(userDetails.role);

    if (userDetails.role !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is a Protected Route for Instructor",
      });
    }

    next(); 
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User Role Can't be Verified",
      error
    });
  }
};

