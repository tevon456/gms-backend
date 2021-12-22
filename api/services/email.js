const nodemailer = require("nodemailer");
const {
  staffAccountCreatedTemplate,
} = require("../templates/accountCreatedTemplate");
require("dotenv");

let transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_AUTH_USER,
    pass: process.env.EMAIL_AUTH_PASSWORD,
  },
});

const staffAccountCreatedEmail = (to_email, template_body) => {
  transporter
    .sendMail({
      to: to_email,
      from: process.env.EMAIL_FROM_ADDRESS,
      subject: "Account Created",
      html: staffAccountCreatedTemplate({ ...template_body }),
    })
    .then(() => {
      console.log(`email sent to ${to_email}`);
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = {
  staffAccountCreatedEmail,
};
