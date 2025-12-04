const nodemailer = require("nodemailer");

exports.sendVerificationEmail = async (toEmail, token) => {
  // Create verification link
  const baseUrl = process.env.CLIENT_URL || "http://localhost:3000";
  const verificationLink = `${baseUrl}/verify?token=${token}`;

  // Setup SMTP transporter (supports Gmail, Brevo, etc)
  const smtpPort = parseInt(process.env.SMTP_PORT) || 587;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: smtpPort,
    secure: smtpPort === 465, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER, //sender email
      pass: process.env.SMTP_PASS  // app password
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: process.env.SMTP_FROM || "noreply.fteat@gmail.com", 
    to: toEmail,
    subject: "Verifikasi Akun FTEat",
    html: `
      <p>Terima kasih telah mendaftar di FTEat.</p>
      <p>Untuk menyelesaikan proses pendaftaran, silakan verifikasi akun kamu melalui link di bawah ini:</p>
      <p><a href="${verificationLink}" target="_blank">${verificationLink}</a></p>
      <p><i>Link ini hanya berlaku selama 5 menit.</i></p>
    `
  };

  // Send the email
  await transporter.sendMail(mailOptions);
  console.log(`Email verifikasi dikirim ke ${toEmail}`);
};

exports.sendResetPasswordEmail = async (toEmail, token) => {
  const baseUrl = process.env.CLIENT_URL || "http://localhost:3000";

  //reset password
  const resetLink = `${baseUrl}/change-password/${token}`;

  const smtpPort2 = parseInt(process.env.SMTP_PORT) || 587;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: smtpPort2,
    secure: smtpPort2 === 465, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: process.env.SMTP_FROM || "noreply.fteat@gmail.com",
    to: toEmail,
    subject: "Reset Password Akun FTEat",
    html: `
      <p>Kami menerima permintaan untuk mereset password akun Anda.</p>
      <p>Silakan klik link di bawah ini untuk membuat password baru:</p>
      
      <p><a href="${resetLink}" target="_blank">${resetLink}</a></p>

      <p><i>Link hanya berlaku selama 5 menit.</i></p>
      <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log(`Email reset password dikirim ke ${toEmail}`);
};
