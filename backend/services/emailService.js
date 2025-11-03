const nodemailer = require("nodemailer");

exports.sendVerificationEmail = async (toEmail, token) => {
  // Create verification link
  const baseUrl = process.env.CLIENT_URL || "http://localhost:3000";
  const verificationLink = `${baseUrl}/verify?token=${token}`;

  // Setup Gmail SMTP transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER, // sender email
      pass: process.env.SMTP_PASS  // app password
    }
  });

  const mailOptions = {
    from: `${process.env.SMTP_USER}`, 
    to: toEmail,
    subject: "Verifikasi Akun FTEat",
    html: `
      <p>Terima kasih telah mendaftar di <b>FTEat</b>.</p>
      <p>Untuk menyelesaikan proses pendaftaran, silakan verifikasi akun kamu melalui tautan di bawah ini:</p>
      <p><a href="${verificationLink}" target="_blank">${verificationLink}</a></p>
      <p><i>Tautan hanya berlaku selama 5 menit.</i></p>
    `
  };

  // Send the email
  await transporter.sendMail(mailOptions);
  console.log(`Email verifikasi dikirim ke ${toEmail}`);
};
