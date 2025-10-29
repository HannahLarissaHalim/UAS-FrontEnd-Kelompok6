const nodemailer = require('nodemailer');

const sendVerificationEmail = async (user) => {
    const { firstName, lastName, email, verificationToken } = user;

    const transporter = nodemailer.createTransport({
        service: 'gmail', // Use your email service
        auth: {
            user: process.env.EMAIL_USER, // Your email address
            pass: process.env.EMAIL_PASS, // Your email password
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Email Verification',
        html: `<h1>Hello ${firstName} ${lastName},</h1>
               <p>Thank you for registering. Please verify your email by clicking the link below:</p>
               <a href="${process.env.BASE_URL}/verify-email?token=${verificationToken}">Verify Email</a>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully');
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Email could not be sent');
    }
};

module.exports = {
    sendVerificationEmail,
};