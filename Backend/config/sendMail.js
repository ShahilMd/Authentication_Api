import { createTransport } from 'nodemailer'

const SMTP_USER = process.env.SMTP_USER
const SMTP_PASSWORD = process.env.SMTP_PASSWORD
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com'
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465
const SMTP_SECURE = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : (SMTP_PORT === 465)

// Basic env check
if (!SMTP_USER || !SMTP_PASSWORD) {
  console.warn('SMTP_USER or SMTP_PASSWORD is not set. Email sending will fail in production.')
}

// create a single reusable transporter with sensible timeouts
const transport = createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
  // timeouts (ms)
  connectionTimeout: 10000,
  greetingTimeout: 5000,
  socketTimeout: 10000,
  tls: {
    // set based on your provider; remove/adjust if not needed
    rejectUnauthorized: false
  }
})

// optional: verify transporter on startup (non-blocking)
transport.verify().then(() => {
  console.log('SMTP transporter verified')
}).catch(err => {
  console.warn('SMTP transporter verification failed:', err.message)
})

const sendMail = async ({ email, subject, html }) => {
  if (!SMTP_USER || !SMTP_PASSWORD) {
    throw new Error('SMTP configuration missing')
  }

  const mailOptions = {
    from: SMTP_USER,
    to: email,
    subject,
    html
  }

  // wrap sendMail with a timeout so it never hangs indefinitely
  const sendPromise = transport.sendMail(mailOptions)
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('SMTP send timeout')), 15000)
  )

  try {
    const result = await Promise.race([sendPromise, timeout])
    return result
  } catch (err) {
    // log and rethrow so caller can handle/respond
    console.error('sendMail error:', err.message || err)
    throw err
  }
}

export default sendMail