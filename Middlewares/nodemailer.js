const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: `${process.env.YOUR_GMAIL_USERNAME}`,
    pass: `${process.env.YOUR_GMAIL_PASSWORD}`,
  }
});

exports.sendMail = (mailOptions,cb) => {
    transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
        cb(error,null);
    } 
    else {
        console.log('Email sent: ' + info);
        cb(null,info);
    }
  })
}