 const sendMail = async (email, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      auth: {
        user: process.env.SMTP_USER, // the email verified in Brevo
        pass: process.env.BREVO_API_KEY, // SMTP key from Brevo (not API key)
      },
    });

    const info = await transporter.sendMail({
      from: '"Authenticator" mdshahilfb786@gmail.com',
      to:email,
      subject,
      html: htmlContent,
    });

    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ SMTP Error:", error);
    throw error;
  }
};

export default sendMail