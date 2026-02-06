import Brevo from "@getbrevo/brevo";

export const mailSender = async (email, title, body) => {
  const apiInstance = new Brevo.TransactionalEmailsApi();

  apiInstance.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
  );

  await apiInstance.sendTransacEmail({
    sender: {
      email: process.env.MAIL_FROM,
      name: "Course Craft",
    },
    to: [{ email }],
    subject: title,
    htmlContent: body,
  });
};
