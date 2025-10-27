// ...existing code...
import { createTransport } from 'nodemailer'

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com'
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASSWORD
const SMTP_SECURE = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : SMTP_PORT === 465
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER

if (!SMTP_USER || !SMTP_PASS || !FROM_EMAIL) {
  console.warn('Missing SMTP config: ensure SMTP_USER, SMTP_PASSWORD and FROM_EMAIL are set')
}

// create one reusable transport (use pooling in production)
const transport = createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  pool: true,
  maxConnections: 5,
  connectionTimeout: 10000,
  greetingTimeout: 5000,
  socketTimeout: 10000,
  tls: { rejectUnauthorized: false }
})

// verify transporter (non-blocking)
transport.verify()
  .then(() => console.log(`SMTP verified ${SMTP_HOST}:${SMTP_PORT}`))
  .catch(err => console.warn('SMTP transporter verification failed:', err.message || err))

// Helper to avoid hanging: race sendMail with timeout
const sendWithTimeout = (mailOptions, ms = 15000) => {
  const sendPromise = transport.sendMail(mailOptions)
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('SMTP send timeout')), ms)
  )
  return Promise.race([sendPromise, timeout])
}

/**
 * sendMail({ email, subject, html, text, maxRetries = 1 })
 */
const sendMail = async ({ email, subject, html, text, maxRetries = 1 }) => {
  if (!SMTP_USER || !SMTP_PASS || !FROM_EMAIL) {
    throw new Error('SMTP configuration missing')
  }

  const mailOptions = {
    from: FROM_EMAIL,
    to: email,
    subject,
    html,
    text,
  }

  let attempt = 0
  while (attempt <= maxRetries) {
    try {
      const info = await sendWithTimeout(mailOptions, 15000)
      return info
    } catch (err) {
      attempt += 1
      // Prefer to expose provider details where available
      const detail = err.response?.body || err.message || String(err)
      console.error(`sendMail attempt ${attempt} failed:`, detail)
      if (attempt > maxRetries) throw err
      await new Promise(r => setTimeout(r, 1000 * attempt))
    }
  }
}

export default sendMail