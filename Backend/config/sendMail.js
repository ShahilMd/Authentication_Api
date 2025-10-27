// ...existing code...
import sgMail from '@sendgrid/mail'

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const FROM_EMAIL = process.env.FROM_EMAIL || process.env.SMTP_USER

if (!SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY not set. Email sending will fail.')
}

sgMail.setApiKey(SENDGRID_API_KEY)

const sendWithTimeout = (msg, ms) => {
  const sendPromise = sgMail.send(msg)
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('SendGrid send timeout')), ms)
  )
  return Promise.race([sendPromise, timeout])
}

/**
 * sendMail({ email, subject, html, text, maxRetries })
 */
const sendMail = async ({ email, subject, html, text, maxRetries = 1 }) => {
  if (!SENDGRID_API_KEY || !FROM_EMAIL) {
    throw new Error('SendGrid configuration missing (SENDGRID_API_KEY or FROM_EMAIL)')
  }

  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject,
    html,
    text,
  }

  let attempt = 0
  while (attempt <= maxRetries) {
    try {
      // 15s timeout per attempt
      await sendWithTimeout(msg, 15_000)
      return true
    } catch (err) {
      attempt += 1
      console.error(`sendMail attempt ${attempt} failed:`, err.message || err)
      if (attempt > maxRetries) throw err
      // small backoff
      await new Promise(r => setTimeout(r, 1000 * attempt))
    }
  }
}

export default sendMail
