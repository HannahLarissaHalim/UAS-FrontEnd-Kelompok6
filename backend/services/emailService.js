const SibApiV3Sdk = require('sib-api-v3-sdk');

// Setup Brevo API client
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

exports.sendVerificationEmail = async (toEmail, token) => {
  const baseUrl = process.env.CLIENT_URL || "http://localhost:3000";
  const verificationLink = `${baseUrl}/verify?token=${token}`;

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = "Verifikasi Akun FTEat";
  sendSmtpEmail.htmlContent = `
    <p>Terima kasih telah mendaftar di FTEat.</p>
    <p>Untuk menyelesaikan proses pendaftaran, silakan verifikasi akun kamu melalui link di bawah ini:</p>
    <p><a href="${verificationLink}" target="_blank">${verificationLink}</a></p>
    <p><i>Link ini hanya berlaku selama 5 menit.</i></p>
  `;
  sendSmtpEmail.sender = { name: "FTEat", email: "noreply@fteat.com" };
  sendSmtpEmail.to = [{ email: toEmail }];

  const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
  console.log(`Email verifikasi dikirim ke ${toEmail}, messageId: ${result.messageId}`);
};

exports.sendResetPasswordEmail = async (toEmail, token) => {
  const baseUrl = process.env.CLIENT_URL || "http://localhost:3000";
  const resetLink = `${baseUrl}/change-password/${token}`;

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = "Reset Password Akun FTEat";
  sendSmtpEmail.htmlContent = `
    <p>Kami menerima permintaan untuk mereset password akun Anda.</p>
    <p>Silakan klik link di bawah ini untuk membuat password baru:</p>
    <p><a href="${resetLink}" target="_blank">${resetLink}</a></p>
    <p><i>Link hanya berlaku selama 5 menit.</i></p>
    <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
  `;
  sendSmtpEmail.sender = { name: "FTEat", email: "noreply@fteat.com" };
  sendSmtpEmail.to = [{ email: toEmail }];

  const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
  console.log(`Email reset password dikirim ke ${toEmail}, messageId: ${result.messageId}`);
};
