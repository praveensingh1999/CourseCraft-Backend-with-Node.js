import { contactUsEmail } from "../mail/templates/contactFormRes.js";
import {mailSender} from "../utils/mailSender.js";

export const contactUsController = async (req, res) => {
  try {
    const {
      email,
      firstname,
      lastname,
      message,
      phoneNo,
      countrycode,
    } = req.body;

     await mailSender(
      email,
      "Your data sent successfully",
      contactUsEmail(
        email,
        firstname,
        lastname,
        message,
        phoneNo,
        countrycode
      )
    );

    // mail send to admin also 
    const emailadmin = "praveen969500@gmail.com"
      await mailSender(
      emailadmin,
      "Please resolve the issue",
      contactUsEmail(
        email,
        firstname,
        lastname,
        message,
        phoneNo,
        countrycode
      )
    );

   // console.log("Email Response:", emailRes);

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Contact Us Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};