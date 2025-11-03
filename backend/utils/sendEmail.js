import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail", // quick dev option; use SendGrid/Mailgun in production
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * sendEmail - sends a simple email.
 * @param {Object} options - { to, subject, text, html }
 */
const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

export default sendEmail;
