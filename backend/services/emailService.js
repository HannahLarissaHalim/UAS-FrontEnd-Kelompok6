const nodemailer = require("nodemailer");

// Create reusable transporter for Brevo SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // use TLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

exports.sendVerificationEmail = async (toEmail, token) => {
  const baseUrl = process.env.CLIENT_URL || "http://localhost:3000";
  const verificationLink = `${baseUrl}/verify?token=${token}`;

  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: toEmail,
    subject: "Verifikasi Akun FTEat",
    html: `
      <p>Terima kasih telah mendaftar di FTEat.</p>
      <p>Untuk menyelesaikan proses pendaftaran, silakan verifikasi akun kamu melalui link di bawah ini:</p>
      <p><a href="${verificationLink}" target="_blank">${verificationLink}</a></p>
      <p><i>Link ini hanya berlaku selama 5 menit.</i></p>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log(`Email verifikasi dikirim ke ${toEmail}`);
};

exports.sendResetPasswordEmail = async (toEmail, token) => {
  const baseUrl = process.env.CLIENT_URL || "http://localhost:3000";
  const resetLink = `${baseUrl}/change-password/${token}`;

  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
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
