import nodemailer from "nodemailer";

export const mailSender = async (email, title, body) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: false,
      auth: {
        user: process.env.MAIL_USER, // apikey
        pass: process.env.MAIL_PASS, // Brevo SMTP key
      },
    });

    const info = await transporter.sendMail({
      from: `"Course Craft" <${process.env.MAIL_FROM}>`, 
      to: email,
      subject: title,
      html: body,
    });

    return info;
  } catch (error) {
    console.error("MailSender Error:", error);
    throw error;
  }
};
