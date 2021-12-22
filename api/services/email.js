const emailjs = require("emailjs-com");
require("dotenv");

emailjs.init(process.env.EMAIL_JS_USER_ID);

const staffAccountEmail = ({ from_name, to_name, dashboard_url, password }) => {
  emailjs
    .send(
      process.env.EMAIL_JS_SERVICE_ID,
      process.env.EMAIL_JS_ACCOUNT_TEMPLATE_ID,
      {
        from_name,
        to_name,
        dashboard_url,
        password,
      }
    )
    .then((response) => {
      console.log(response.status, response.text);
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = {
  staffAccountEmail,
};
