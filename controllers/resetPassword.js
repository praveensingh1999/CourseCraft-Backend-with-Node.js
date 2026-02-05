import User from "../models/User.js"
import {mailSender} from "../utils/mailSender.js"
import crypto from "crypto"
import bcrypt from "bcryptjs"

// ================= RESET PASSWORD TOKEN =================
export const resetPasswordToken = async (req, res) => {
  try {
    //get email from req body
    const { email } = req.body

    // check user for the email/ email validation
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email not registered",
      })
    }

    // geneerate token
    const token = crypto.randomBytes(20).toString("hex")

    // update user by adding token and expiration time
    await User.findOneAndUpdate(
      { email },
      {
        token,
        resetPasswordExpires: Date.now() + 3600000, // 1 hour
      },
      { new: true }
    )
    // generate url
    const url = `${process.env.FRONTEND_URL}/update-password/${token}`

    // send email containing the url
    await mailSender(
      email,
      "Password Reset",
      `Click the link to reset your password: ${url}`
    )
 
    // return response
    return res.status(200).json({
      success: true,
      message: "Password reset link sent to email",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error sending reset password email",
      error: error.message,
    })
  }
}

export const resetPassword = async(req, res)=>{

  try {
     // data fetch
  const {password, confirmPassword, token} = req.body;

  // validation
  if(password !== confirmPassword){
    return res.json({
      success: false,
      message: 'Password not matching',
    })
  }
  // get userdetails from db using token
  const userDetails = await User.findOne({ token});
  // if no entry - invalid token
    if(!userDetails){
      return res.json({
        success: false,
        message: 'Token is invalid',
      })
    }
  //  console.log(userDetails);
  // token time check
  if(userDetails.resetPasswordExpires < Date.now()){
     return res.json({
      success: false,
      message: `Token is expired, please regenerate your token`,
     });
  }
  //console.log("here");
  // hash pwd
   const hashedPassword = await bcrypt.hash(password, 10);
  // password update
 await User.findOneAndUpdate(
  { token },
  {
    password: hashedPassword,
    token: undefined,
    resetPasswordExpires: undefined,
  },
  { new: true }
);
  
  return res.status(200).json({
    success: true,
    message: 'Password reset successfully',
  });

    
  } catch (error) {
    console.log(error);
     return res.status(500).json({
      success: false,
      message: 'Someting went wrong sending reset password mail'
     })
  }
 
  
  
}
