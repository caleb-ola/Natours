const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create Transporter
  const transporter = nodemailer.createTransport({
    // host: 'sandbox.smtp.mailtrap.io',
    // port: 2525,
    // greetingTimeout: 1000 * 5000,
    // auth: {
    //   user: '853f494a397a19',
    //   pass: '43d9b6417491b6',
    // },
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT * 1,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Activate in gmail "less secure app" option
  });
  // 2. Define the email options
  const mailOptions = {
    from: 'Natours <hello@natours.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3. Actually send the email
  await transporter.sendMail(mailOptions);

  //   transporter.sendMail(mailOptions, (err, info) => {
  //     if (err) {
  //       console.log('Error occurred. ' + err.message);
  //     }

  //     console.log('Message sent: %s', info.messageId);
  //     // Preview only available when sending through an Ethereal account
  //     // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  //   });
};

module.exports = sendEmail;
