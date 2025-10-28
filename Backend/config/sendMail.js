import dotenv from "dotenv";
dotenv.config();

import { createTransport } from "nodemailer";

const SMTP_HOST = (process.env.SMTP_HOST).trim();
const SMTP_PORT = Number(process.env.SMTP_PORT);
const SMTP_USER = (process.env.BREVO_SMTP_USER || process.env.SMTP_USER || "").trim(); // e.g. 896454001@smtp-brevo.com
const SMTP_PASS = (process.env.BREVO_SMTP_KEY || process.env.BREVO_SMTP_PASS || "").trim(); // xsmtp_...
const FROM_EMAIL = (process.env.FROM_EMAIL || process.env.SMTP_FROM || SMTP_USER || "").trim();
const FROM_NAME = (process.env.FROM_NAME || "").trim();

// debug presence (no secrets)
console.log("DEBUG SMTP_USER present?", !!SMTP_USER, "SMTP_PASS present?", !!SMTP_PASS, "FROM_EMAIL present?", !!FROM_EMAIL);

if (!SMTP_USER || !SMTP_PASS || !FROM_EMAIL) {
  console.warn("⚠️ Missing SMTP config. Set SMTP_USER (or BREVO_SMTP_USER), BREVO_SMTP_KEY and FROM_EMAIL.");
  // do not crash here — controllers will handle errors — but warn loudly
}

const transporter = createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // use TLS on 465, STARTTLS on 587 (secure=false)
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  logger: true,        // enable nodemailer logging
  debug: true,         // show SMTP conversation
  connectionTimeout: 30000,
  greetingTimeout: 10000,
  socketTimeout: 30000,
  tls: { rejectUnauthorized: false },
  pool: true,
  maxConnections: 5,
});

transporter.verify()
  .then(() => console.log(`✅ SMTP verified: ${SMTP_HOST}:${SMTP_PORT} (user=${SMTP_USER})`))
  .catch(err => console.warn(`❌ SMTP verify failed: ${err && err.message ? err.message : err}`));

const sendWithTimeout = (mailOptions, ms = 15000) => {
  const sendPromise = transporter.sendMail(mailOptions);
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("SMTP send timeout")), ms));
  return Promise.race([sendPromise, timeout]);
};

const sendMail = async ({ email, subject, html }) => {
  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP configuration missing (SMTP_USER or BREVO_SMTP_KEY).");
  }
  const mailOptions = {
    from: FROM_NAME ? `"${FROM_NAME}" <${FROM_EMAIL}>` : FROM_EMAIL,
    to: email,
    subject,
    html,
  };

  try {
    const info = await sendWithTimeout(mailOptions, 15000);
    console.log("✅ Email sent:", info.messageId || info.response || info);
    return info;
  } catch (err) {
    // more actionable logging for common failures
    if (err && err.code === "EAUTH") {
      console.error("❌ SMTP Auth failed. Check SMTP_USER and BREVO SMTP key (use SMTP relay key, not REST API key).", err.message);
    } else if (err && /timeout/i.test(err.message)) {
      console.error("❌ SMTP connection/send timeout:", err.message);
    } else {
      console.error("❌ SMTP Error:", err && err.message ? err.message : err);
    }
    throw err;
  }
};

export default sendMail;